// app/api/news/route.ts — Dynamic news ticker derived from live election data

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
}

export async function GET() {
  const data = await fetchElectionResults();
  const now = new Date().toISOString();
  const items: NewsItem[] = [];

  const allConsts = data.provinces.flatMap((p) =>
    p.districts.flatMap((d) => d.constituencies)
  );

  // 1. Declared seats — actual winners from current data
  const declared = allConsts.filter((c) => c.status === "declared").slice(0, 4);
  for (const [i, c] of declared.entries()) {
    const winner = c.candidates.find((x) => x.isWinner) ?? c.candidates[0];
    if (!winner) continue;
    const info = PARTY_INFO[winner.party];
    items.push({
      id: `declared-${i}`,
      titleNe: `🔥 ${c.nameNe}: ${winner.name} (${info?.shortNe ?? winner.party}) +${winner.leadBy?.toLocaleString("en-IN") ?? "—"} मतले विजयी`,
      titleEn: `🔥 ${c.nameEn}: ${winner.nameEn ?? winner.name} (${info?.shortEn ?? winner.party}) DECLARED +${winner.leadBy?.toLocaleString("en-IN") ?? "—"} votes`,
      hot: true,
      category: "declared",
      timestamp: now,
    });
  }

  // 2. Knife-edge races (margin < 800 votes)
  const closeRaces = allConsts
    .filter((c) => c.leadingMargin > 0 && c.leadingMargin < 800 && c.status !== "not_started")
    .sort((a, b) => a.leadingMargin - b.leadingMargin)
    .slice(0, 3);
  for (const [i, c] of closeRaces.entries()) {
    const info = PARTY_INFO[c.leadingParty];
    items.push({
      id: `close-${i}`,
      titleNe: `⚔️ ${c.nameNe}: ${info?.shortNe ?? c.leadingParty} केवल +${c.leadingMargin.toLocaleString("en-IN")} मतले अग्रणी!`,
      titleEn: `⚔️ ${c.nameEn}: ${info?.shortEn ?? c.leadingParty} leads by only +${c.leadingMargin.toLocaleString("en-IN")} votes!`,
      hot: true,
      category: "close",
      timestamp: now,
    });
  }

  // 3. Province sweep leaders
  for (const [i, p] of data.provinces.filter((p) => p.seatsReported > 0).slice(0, 2).entries()) {
    const info = PARTY_INFO[p.leadingParty];
    items.push({
      id: `prov-${i}`,
      titleNe: `📈 ${p.nameNe}: ${info?.shortNe ?? p.leadingParty} ${p.seatsReported}/${p.totalSeats} सिटमा अग्रणी`,
      titleEn: `📈 ${p.nameEn}: ${info?.shortEn ?? p.leadingParty} leads in ${p.seatsReported}/${p.totalSeats} seats`,
      hot: false,
      category: "trend",
      timestamp: now,
    });
  }

  // 4. National overall progress
  const topParty = Object.entries(data.nationalTotals)
    .sort(([, a], [, b]) => (b?.seats ?? 0) - (a?.seats ?? 0))[0];
  const topInfo = topParty ? PARTY_INFO[topParty[0] as keyof typeof PARTY_INFO] : null;
  items.push({
    id: "national",
    titleNe: `⚡ राष्ट्रिय: ${data.seatsReported}/१६५ सिट घोषित — ${topInfo?.shortNe ?? topParty?.[0] ?? "—"} अग्रणी | ${data.progress.percentage.toFixed(0)}% मतगणना`,
    titleEn: `⚡ National: ${data.seatsReported}/165 seats declared — ${topInfo?.shortEn ?? topParty?.[0] ?? "—"} leading | ${data.progress.percentage.toFixed(0)}% counted`,
    hot: true,
    category: "update",
    timestamp: now,
  });

  // 5. Biggest win margin
  const biggestWin = allConsts
    .filter((c) => c.status === "declared" && c.leadingMargin > 0)
    .sort((a, b) => b.leadingMargin - a.leadingMargin)[0];
  if (biggestWin) {
    const winner = biggestWin.candidates[0];
    const info = PARTY_INFO[winner?.party];
    items.push({
      id: "bigwin",
      titleNe: `🏆 सबैभन्दा ठूलो जित: ${biggestWin.nameNe} — ${winner?.name ?? ""} (${info?.shortNe ?? ""}) +${biggestWin.leadingMargin.toLocaleString("en-IN")} मत`,
      titleEn: `🏆 Biggest win: ${biggestWin.nameEn} — ${winner?.nameEn ?? winner?.name ?? ""} (${info?.shortEn ?? ""}) +${biggestWin.leadingMargin.toLocaleString("en-IN")} votes`,
      hot: false,
      category: "trend",
      timestamp: now,
    });
  }

  return NextResponse.json(items, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, must-revalidate",
      "Content-Type": "application/json",
    },
  });
}
