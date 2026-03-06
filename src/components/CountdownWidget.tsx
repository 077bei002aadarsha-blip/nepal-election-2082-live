"use client";

// CountdownWidget.tsx — 320×50 counting-progress strip with leading party + WhatsApp share

import { useContext } from "react";
import { LanguageContext } from "@/app/providers";
import { PARTY_INFO } from "@/lib/mock-data";
import type { ElectionResults, PartyCode } from "@/lib/types";

interface Props { data: ElectionResults }

export default function CountdownWidget({ data }: Props) {
  const { language } = useContext(LanguageContext);
  const ne = language === "ne";

  const total     = data.totalSeats ?? 165;
  const declared  = data.seatsReported ?? 0;
  const remaining = total - declared;
  const pct       = total > 0 ? (declared / total) * 100 : 0;
  const circumference = 2 * Math.PI * 11; // r=11

  // Leading party by votes nationally
  const topEntry = (
    Object.entries(data.nationalTotals) as [
      PartyCode,
      { seats: number; votes: number; percentage: number },
    ][]
  )
    .filter(([, v]) => v.votes > 0)
    .sort(([, a], [, b]) => b.votes - a.votes)[0];

  const info = topEntry ? PARTY_INFO[topEntry[0]] : undefined;

  const shareText = ne
    ? `नेपाल निर्वाचन २०८२: ${declared}/${total} सिट घोषणा | ${
        info ? `${info.shortNe} अग्रणी` : ""
      } | 🇳🇵 result.election.gov.np`
    : `Nepal Election 2082: ${declared}/${total} seats declared | ${
        info ? `${info.shortEn} leading` : ""
      } | 🇳🇵 result.election.gov.np`;

  return (
    <div
      className="rounded-xl overflow-hidden
        bg-gradient-to-r from-orange-100/80 via-red-50/70 to-slate-50 dark:from-orange-950/80 dark:via-red-950/70 dark:to-slate-900
        border border-orange-300/50 dark:border-orange-700/30 h-[50px] flex items-center px-3 gap-2.5"
    >
      {/* Circular progress */}
      <div className="relative w-7 h-7 shrink-0">
        <svg viewBox="0 0 28 28" className="w-7 h-7 -rotate-90">
          <circle
            cx="14" cy="14" r="11"
            className="fill-none stroke-slate-300 dark:stroke-slate-700"
            strokeWidth="3"
          />
          <circle
            cx="14" cy="14" r="11"
            className="fill-none stroke-orange-500 transition-all duration-700"
            strokeWidth="3"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${circumference * (1 - pct / 100)}`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[7px] font-black text-orange-400">
          {Math.round(pct)}%
        </span>
      </div>

      {/* Seats declared */}
      <div className="shrink-0">
        <p className="text-[8px] text-slate-500 leading-none">{ne ? "सिट घोषणा" : "SEATS"}</p>
        <p className="text-xs font-black text-slate-900 dark:text-white leading-none tabular-nums">
          {declared}
          <span className="text-slate-400 dark:text-slate-500 font-normal text-[9px]">/{total}</span>
        </p>
      </div>

      <div className="h-5 w-px bg-slate-300 dark:bg-slate-700/50 shrink-0" />

      {/* Leading party */}
      {info && topEntry && (
        <div className="flex items-center gap-1.5 min-w-0 shrink-0">
          <div className={`w-2 h-2 rounded-full ${info.bgColor}`} />
          <div className="min-w-0">
            <p className="text-[8px] text-slate-500 leading-none">{ne ? "अग्रणी" : "Leading"}</p>
            <p className={`text-[10px] font-black leading-none truncate ${info.textColor}`}>
              {ne ? info.shortNe : info.shortEn}
            </p>
          </div>
          {topEntry[1].seats > 0 && (
            <span className="text-[10px] font-black text-slate-300 tabular-nums shrink-0">
              {topEntry[1].seats}✓
            </span>
          )}
        </div>
      )}

      {/* Remaining + share — pushed to the right */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        {remaining > 0 && (
          <p className="text-[9px] text-slate-500 tabular-nums hidden sm:block">
            <span className="text-orange-400 font-black">{remaining}</span>
            {ne ? " बाँकी" : " left"}
          </p>
        )}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-600 hover:bg-emerald-500 transition-colors
            text-white text-[9px] font-bold px-2 py-1 rounded-full"
        >
          Share
        </a>
      </div>
    </div>
  );
}
