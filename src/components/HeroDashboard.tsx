"use client";

// HeroDashboard.tsx — CNN-level above-fold hero: seats, votes, party bars, search, share

import { useState, useContext, useMemo } from "react";
import { LanguageContext } from "@/app/providers";
import { PARTY_INFO } from "@/lib/mock-data";
import type { ElectionResults } from "@/lib/types";
import { LiveCounter } from "./LiveCounter";
import { LiveDot, StatusPill } from "./LiveIndicators";
import WhatsAppShareButton, { buildNationalShareText } from "./WhatsAppShareButton";

const MAJORITY = 83;
const TOTAL_SEATS = 165;

// Province short labels for the top bar
const PROV_SHORT: Record<string, { ne: string; en: string }> = {
  koshi:         { ne: "क", en: "Ko" },
  madhesh:       { ne: "म", en: "Ma" },
  bagmati:       { ne: "बा", en: "Ba" },
  gandaki:       { ne: "ग", en: "Ga" },
  lumbini:       { ne: "लु", en: "Lu" },
  karnali:       { ne: "क", en: "Ka" },
  sudurpaschim:  { ne: "सु", en: "Su" },
};

interface Props {
  data: ElectionResults;
}

export default function HeroDashboard({ data }: Props) {
  const { language } = useContext(LanguageContext);
  const ne = language === "ne";
  const [searchTerm, setSearchTerm] = useState("");

  // Top parties by seats then votes
  const topParties = useMemo(() => {
    return Object.entries(data.nationalTotals)
      .map(([code, totals]) => ({ code, ...totals! }))
      .sort((a, b) => (b.seats - a.seats) || (b.votes - a.votes))
      .slice(0, 5);
  }, [data.nationalTotals]);

  const totalVotesCounted = data.totalVotesCounted;
  const topVoteParty = topParties?.[0];
  const topVoteCount = topVoteParty?.votes ?? 1;

  // Search: find matching constituencies
  const searchResults = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return [];
    const hits: Array<{ province: string; district: string; name: string; id: string; status: string; leaderName: string; leaderVotes: number }> = [];
    for (const prov of data.provinces) {
      for (const dist of prov.districts) {
        for (const con of dist.constituencies) {
          const haystack = [con.nameNe, con.nameEn, dist.nameNe, dist.nameEn, prov.nameEn].join(" ").toLowerCase();
          if (haystack.includes(q)) {
            hits.push({
              province: ne ? prov.nameNe : prov.nameEn,
              district: ne ? dist.nameNe : dist.nameEn,
              name: ne ? con.nameNe : con.nameEn,
              id: con.id,
              status: con.status,
              leaderName: ne ? (con.candidates[0]?.name ?? "") : (con.candidates[0]?.nameEn ?? ""),
              leaderVotes: con.candidates[0]?.votes ?? 0,
            });
          }
        }
      }
    }
    return hits.slice(0, 8);
  }, [searchTerm, data.provinces, ne]);

  const shareText = buildNationalShareText({
    declared: data.seatsReported,
    totalVotes: data.totalVotesCounted,
    topParty: topParties[0] ? (ne ? PARTY_INFO[topParties[0].code as keyof typeof PARTY_INFO]?.nameNe : PARTY_INFO[topParties[0].code as keyof typeof PARTY_INFO]?.nameEn) ?? topParties[0].code : "",
    ne,
  });

  const pct = data.progress.percentage;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/50
      bg-white dark:bg-gradient-to-b dark:from-slate-800 dark:to-slate-900 shadow-2xl">

      {/* ── TOP BAR: LIVE badge + timestamp ─────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 bg-red-600/10 border-b border-red-500/20 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <LiveDot />
          <span className="text-xs font-black text-red-400 tracking-widest uppercase">
            {ne ? "लाइभ" : "LIVE"}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            {ne ? "मतगणना जारी छ" : "Counting in progress"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500 dark:text-slate-500">{data.lastUpdated} NST</span>
          <WhatsAppShareButton text={shareText} label={ne ? "शेयर" : "Share"} />
        </div>
      </div>

      {/* ── MAIN STATS ROW ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-y divide-slate-200 dark:divide-slate-700/50
        border-b border-slate-200 dark:border-slate-700/50">
        <StatTile
          label={ne ? "घोषित" : "Declared"}
          value={data.seatsReported}
          sub={`/ ${TOTAL_SEATS} ${ne ? "सिट" : "seats"}`}
          color="text-emerald-400"
          icon="✓"
        />
        <StatTile
          label={ne ? "अग्रणी" : "Leading"}
          value={data.seatsLeading}
          sub={ne ? "मतगणना जारी" : "counting"}
          color="text-blue-400"
          icon="●"
          pulse
        />
        <StatTile
          label={ne ? "कुल मत" : "Total Votes"}
          value={totalVotesCounted}
          animate
          color="text-amber-400"
          icon="🗳"
        />
        <StatTile
          label={ne ? "प्रगति" : "Counted"}
          value={null}
          pct={pct}
          sub={`${data.progress.counted}/${TOTAL_SEATS} ${ne ? "क्षेत्र" : "constituencies"}`}
          color="text-violet-400"
          icon="📊"
        />
      </div>

      {/* ── MAJORITY BAR ─────────────────────────────────────────────────── */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/50">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            {ne ? `बहुमत — ${MAJORITY} सिट` : `Majority line — ${MAJORITY} seats`}
          </span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500">
            {ne ? "१६५ FPTP सिट" : "165 FPTP seats"}
          </span>
        </div>
        {/* Multi-party seat bar */}
        <div className="h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700/60 flex">
          {topParties.map((p) => {
            const info = PARTY_INFO[p.code as keyof typeof PARTY_INFO];
            const w = (p.seats / TOTAL_SEATS) * 100;
            if (w < 0.5) return null;
            return (
              <div
                key={p.code}
                className={`h-full transition-all duration-700 ${info?.bgColor ?? "bg-gray-500"}`}
                style={{ width: `${w}%` }}
                title={`${info?.nameEn ?? p.code}: ${p.seats} seats`}
              />
            );
          })}
          <div className="flex-1 h-full bg-slate-600/40" />
        </div>
        {/* Majority marker */}
      <div className="h-0 -mt-0.5 relative">
          <div
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${(MAJORITY / TOTAL_SEATS) * 100}%` }}
          >
            <div className="w-px h-2 bg-slate-600 dark:bg-white/60" />
            <span className="text-[9px] text-slate-600 dark:text-white/60 font-bold mt-0.5 whitespace-nowrap">{MAJORITY}</span>
          </div>
        </div>
      </div>

      {/* ── PARTY VOTE SHARE ─────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700/50">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
          {ne ? "पार्टी मत प्रतिशत" : "Party Vote Share"}
        </p>
        <div className="space-y-2">
          {topParties.slice(0, 5).map((p) => {
            const info = PARTY_INFO[p.code as keyof typeof PARTY_INFO];
            const pct = totalVotesCounted > 0 ? (p.votes / totalVotesCounted) * 100 : 0;
            const barW = totalVotesCounted > 0 ? (p.votes / topVoteCount) * 100 : 0;
            return (
              <div key={p.code} className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300 dark:text-slate-300 w-16 shrink-0 truncate">
                  {ne ? info?.shortNe : info?.shortEn ?? p.code}
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700/50 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${info?.bgColor ?? "bg-gray-500"}`}
                    style={{ width: `${barW}%` }}
                  />
                </div>
                <span className={`text-xs font-black tabular-nums w-12 text-right ${info?.textColor ?? "text-gray-400"}`}>
                  {pct.toFixed(1)}%
                </span>
                {p.seats > 0 && (
                  <span className="text-xs font-bold text-emerald-400 w-8 text-right tabular-nums">
                    {p.seats}✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SEARCH BAR ───────────────────────────────────────────────────── */}
      <div className="px-4 py-3 relative">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={ne ? "काठमाडौं १, झापा, बागमती..." : "Search: Kathmandu 1, Jhapa, Bagmati..."}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700/60 border border-slate-300 dark:border-slate-600/50
              text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 outline-none
              focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400
                hover:text-slate-200 text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>

        {/* Search dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute left-4 right-4 top-full mt-1 z-50 rounded-xl overflow-hidden
            border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-800 shadow-2xl divide-y divide-slate-100 dark:divide-slate-700/50">
            {searchResults.map((r, i) => (
              <a
                key={i}
                href={`/results/${r.id}`}
                className="flex items-center justify-between px-4 py-3
                  hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">{r.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{r.province} › {r.district}</p>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  {r.leaderVotes > 0 && (
                    <span className="text-sm font-bold text-amber-500 dark:text-amber-400 tabular-nums">
                      {r.leaderVotes.toLocaleString("en-IN")}
                    </span>
                  )}
                  <StatusPill status={r.status} ne={ne} />
                </div>
              </a>
            ))}
          </div>
        )}
        {searchTerm && searchResults.length === 0 && (
          <div className="absolute left-4 right-4 top-full mt-1 z-50 rounded-xl
            border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-800 shadow-xl px-4 py-3">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              {ne ? "कुनै नतिजा भेटिएन" : "No results found"}
            </p>
          </div>
        )}
      </div>

      {/* ── PROVINCE MINI SUMMARY ────────────────────────────────────────── */}
      <div className="px-4 pb-3 flex gap-1.5 flex-wrap">
        {data.provinces.map((prov) => {
          const info = PARTY_INFO[prov.leadingParty];
          const short = PROV_SHORT[prov.id];
          return (
            <div
              key={prov.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full
                bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/40 text-[10px] font-bold"
              title={ne ? prov.nameNe : prov.nameEn}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${info?.bgColor ?? "bg-gray-400"}`} />
              <span className="text-slate-600 dark:text-slate-300">{ne ? short?.ne : short?.en}</span>
              <span className="text-slate-500 dark:text-slate-500">{prov.seatsReported}/{prov.totalSeats}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Stat tile ─────────────────────────────────────────────────────────────────
function StatTile({
  label,
  value,
  sub,
  pct,
  color,
  icon,
  animate,
  pulse,
}: {
  label: string;
  value: number | null;
  sub?: string;
  pct?: number;
  color: string;
  icon: string;
  animate?: boolean;
  pulse?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-5 px-2 text-center">
      <span className="text-xl mb-1">{icon}</span>
      <div className={`text-3xl sm:text-4xl font-black tabular-nums ${color}`}>
        {value !== null ? (
          animate ? <LiveCounter value={value} label="" /> : value.toLocaleString("en-IN")
        ) : (
          <span>{pct?.toFixed(1)}%</span>
        )}
      </div>
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}
