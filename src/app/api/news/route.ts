// app/api/news/route.ts — Live election news from Nepali RSS feeds + ECN data fallback

import { NextResponse } from "next/server";
import { fetchElectionResults } from "@/lib/ecn-parser";
import { PARTY_INFO } from "@/lib/mock-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface NewsItem {
  id: string;
  titleNe: string;
  titleEn: string;
  hot: boolean;
  category: "declared" | "close" | "trend" | "update";
  timestamp: string;
  source?: string;
}

// ─── RSS sources ────────────────────────────────────────────────────────────
const RSS_SOURCES = [
  { url: "https://ratopati.com/feed", name: "Ratopati" },
  { url: "https://setopati.com/feed", name: "Setopati" },
  { url: "https://www.onlinekhabar.com/feed", name: "Online Khabar" },
  { url: "https://myrepublica.nagariknetwork.com/feed/", name: "My Republica" },
  { url: "https://www.nepalitimes.com/feed/", name: "Nepali Times" },
];

const ELECTION_KEYWORDS = [
  "चुनाव", "निर्वाचन", "election", "2082", "मतगणना", "नतिजा",
  "result", "vote", "fptp", "मत", "विजय", "पराजय", "मतदान",
  "प्रतिनिधि", "constituency", "candidat",
];

function isElectionRelated(title: string): boolean {
  const lower = title.toLowerCase();
  return ELECTION_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

function parseRSSItems(xml: string, sourceName: string): { title: string; source: string }[] {
  const out: { title: string; source: string }[] = [];
  const itemRx = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRx.exec(xml)) !== null) {
    const titleMatch = m[1].match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
    if (titleMatch?.[1]?.trim()) {
      out.push({ title: titleMatch[1].trim(), source: sourceName });
    }
  }
  return out;
}

async function fetchRSS(url: string, timeoutMs = 5000): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 Nepal-Election-Live/1.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

export async function GET() {
  const now = new Date().toISOString();

  // ── Step 1: Try to get real headlines from Nepali RSS feeds ────────────────
  const rssResults = await Promise.allSettled(
    RSS_SOURCES.map(async (src) => {
      const xml = await fetchRSS(src.url);
      return parseRSSItems(xml, src.name);
    })
  );

  const allRssItems: { title: string; source: string }[] = [];
  for (const r of rssResults) {
    if (r.status === "fulfilled") allRssItems.push(...r.value);
  }

  const electionNews = allRssItems
    .filter((item) => isElectionRelated(item.title))
    .slice(0, 10);

  if (electionNews.length > 0) {
    const items: NewsItem[] = electionNews.map((item, i) => ({
      id: `rss-${i}`,
      titleNe: `📰 ${item.title}`,
      titleEn: `📰 ${item.title}`,
      hot: i < 3,
      category: "update" as const,
      timestamp: now,
      source: item.source,
    }));
    return NextResponse.json(items, {
      status: 200,
      headers: { "Cache-Control": "no-store, must-revalidate", "Content-Type": "application/json" },
    });
  }

  // ── Step 2: RSS had no election news — try ECN live data ──────────────────
  const data = await fetchElectionResults();
  const items: NewsItem[] = [];

  if (!data.isLive) {
    // ECN also unreachable — show "awaiting" placeholders
    return NextResponse.json([
      { id: "await-1", titleNe: "🗳️ नेपाल चुनाव २०८२: मतगणना सुरु हुन बाँकी — नतिजाको प्रतीक्षा गर्नुहोस्", titleEn: "🗳️ Nepal Election 2082: Counting not yet started — Awaiting results", hot: false, category: "update", timestamp: now, source: "nepal-election-live.vercel.app" },
      { id: "await-2", titleNe: "⚡ सबै १६५ निर्वाचन क्षेत्रको नतिजा यहाँ लाइभ देखाइनेछ", titleEn: "⚡ All 165 constituency results will appear here LIVE once counting begins", hot: false, category: "update", timestamp: now, source: "nepal-election-live.vercel.app" },
      { id: "await-3", titleNe: "📡 चुनाव आयोग नेपाल (ECN) बाट सिधा लाइभ डेटा", titleEn: "📡 Live data direct from Election Commission Nepal (ECN)", hot: false, category: "update", timestamp: now, source: "ECN" },
    ] satisfies NewsItem[], {
      status: 200,
      headers: { "Cache-Control": "no-store, must-revalidate", "Content-Type": "application/json" },
    });
  }

  // ── Step 3: Derive news from live ECN data ─────────────────────────────────
  const allConsts = data.provinces.flatMap((p) => p.districts.flatMap((d) => d.constituencies));

  for (const [i, c] of allConsts.filter((c) => c.status === "declared").slice(0, 4).entries()) {
    const winner = c.candidates.find((x) => x.isWinner) ?? c.candidates[0];
    if (!winner) continue;
    const info = PARTY_INFO[winner.party];
    items.push({
      id: `declared-${i}`,
      titleNe: `🔥 ${c.nameNe}: ${winner.name} (${info?.shortNe ?? winner.party}) +${winner.leadBy?.toLocaleString("en-IN") ?? "—"} मतले विजयी`,
      titleEn: `🔥 ${c.nameEn}: ${winner.nameEn ?? winner.name} (${info?.shortEn ?? winner.party}) DECLARED +${winner.leadBy?.toLocaleString("en-IN") ?? "—"} votes`,
      hot: true, category: "declared", timestamp: now, source: "ECN",
    });
  }

  for (const [i, c] of allConsts
    .filter((c) => c.leadingMargin > 0 && c.leadingMargin < 800 && c.status !== "not_started")
    .sort((a, b) => a.leadingMargin - b.leadingMargin)
    .slice(0, 3)
    .entries()) {
    const info = PARTY_INFO[c.leadingParty];
    items.push({
      id: `close-${i}`,
      titleNe: `⚔️ ${c.nameNe}: ${info?.shortNe ?? c.leadingParty} केवल +${c.leadingMargin.toLocaleString("en-IN")} मतले अग्रणी!`,
      titleEn: `⚔️ ${c.nameEn}: ${info?.shortEn ?? c.leadingParty} leads by only +${c.leadingMargin.toLocaleString("en-IN")} votes!`,
      hot: true, category: "close", timestamp: now, source: "ECN",
    });
  }

  const topParty = Object.entries(data.nationalTotals).sort(([, a], [, b]) => (b?.seats ?? 0) - (a?.seats ?? 0))[0];
  const topInfo = topParty ? PARTY_INFO[topParty[0] as keyof typeof PARTY_INFO] : null;
  items.push({
    id: "national",
    titleNe: `⚡ राष्ट्रिय: ${data.seatsReported}/१६५ सिट घोषित — ${topInfo?.shortNe ?? topParty?.[0] ?? "—"} अग्रणी | ${data.progress.percentage.toFixed(0)}% मतगणना`,
    titleEn: `⚡ National: ${data.seatsReported}/165 seats declared — ${topInfo?.shortEn ?? topParty?.[0] ?? "—"} leading | ${data.progress.percentage.toFixed(0)}% counted`,
    hot: true, category: "update", timestamp: now, source: "ECN",
  });

  return NextResponse.json(items, {
    status: 200,
    headers: { "Cache-Control": "no-store, must-revalidate", "Content-Type": "application/json" },
  });
}

