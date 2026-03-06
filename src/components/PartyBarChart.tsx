"use client";

// PartyBarChart.tsx — Horizontal national vote-share bars with seat badges

import { useContext } from "react";
import { LanguageContext } from "@/app/providers";
import { PARTY_INFO } from "@/lib/mock-data";
import type { ElectionResults, PartyCode } from "@/lib/types";

interface Props { data: ElectionResults }

export default function PartyBarChart({ data }: Props) {
  const { language } = useContext(LanguageContext);
  const ne = language === "ne";

  const parties = (
    Object.entries(data.nationalTotals) as [PartyCode, { seats: number; votes: number; percentage: number }][]
  )
    .filter(([, v]) => v.votes > 0)
    .sort(([, a], [, b]) => b.votes - a.votes);

  const maxVotes = parties[0]?.[1].votes ?? 1;
  const total    = data.totalVotesCounted || 1;
  const majority = 83;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700/40 flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {ne ? "राष्ट्रिय मत प्रतिशत" : "National Vote Share"}
        </h3>
        <span className="text-[10px] text-slate-500">
          {ne
            ? `${total.toLocaleString("en-IN")} कुल मत`
            : `${total.toLocaleString("en-IN")} total votes`}
        </span>
      </div>

      {/* Bars */}
      <div className="px-4 py-3 space-y-2.5">
        {parties.slice(0, 8).map(([code, t]) => {
          const info  = PARTY_INFO[code];
          const pct   = (t.votes / total) * 100;
          const barW  = (t.votes / maxVotes) * 100;
          const label = ne ? info?.shortNe : info?.shortEn ?? code;

          return (
            <div key={code} className="flex items-center gap-2.5">
              {/* Label */}
              <div className="w-20 shrink-0 flex items-center gap-1.5 justify-end">
                <div className={`w-2 h-2 rounded-full shrink-0 ${info?.bgColor ?? "bg-gray-500"}`} />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">{label}</span>
              </div>

              {/* Bar track */}
              <div className="flex-1 h-4 rounded bg-slate-200 dark:bg-slate-700/50 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${info?.bgColor ?? "bg-gray-500"}`}
                  style={{ width: `${barW}%` }}
                />
              </div>

              {/* Stats */}
              <div className="flex items-center gap-1.5 w-20 shrink-0">
                <span className={`text-[10px] font-black tabular-nums ${info?.textColor ?? "text-gray-400"}`}>
                  {pct.toFixed(1)}%
                </span>
                {t.seats > 0 && (
                  <span className="text-[10px] font-bold text-emerald-400
                    bg-emerald-500/10 border border-emerald-500/20 px-1 rounded tabular-nums">
                    {t.seats}✓
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700/40 text-[10px] text-slate-400 dark:text-slate-500 flex gap-4">
        <span>{ne ? `बहुमत = ${majority} सिट` : `Majority = ${majority} seats`}</span>
        <span>{ne ? `FPTP ${data.totalSeats} सिट` : `${data.totalSeats} FPTP seats`}</span>
      </div>
    </div>
  );
}
