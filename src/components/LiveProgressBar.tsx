"use client";
import { useContext } from "react";
import { LanguageContext } from "@/app/providers";
import type { ElectionProgress } from "@/lib/types";

interface Props { progress: ElectionProgress }

export default function LiveProgressBar({ progress }: Props) {
  const { language } = useContext(LanguageContext);
  const ne = language === "ne";
  const pct = progress.percentage.toFixed(1);

  return (
    <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200
      dark:border-slate-700 shadow-sm px-4 py-3 space-y-2">
      {/* top row */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
        <span className="text-slate-500 dark:text-slate-400">
          {ne ? "मतगणना प्रगति" : "Vote Counting Progress"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block" />
          <span className="text-green-600 dark:text-green-400 font-bold">{ne ? "लाइभ" : "LIVE"}</span>
        </span>
      </div>

      {/* bar */}
      <div className="relative h-4 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500
            transition-all duration-700 ease-out"
          style={{ width: `${Math.min(progress.percentage, 100)}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-[11px]
          font-bold text-white drop-shadow">
          {pct}%
        </span>
      </div>

      {/* stats row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
        <span>
          <strong>{progress.seatsReported}</strong> / {progress.totalSeats}
          {ne ? " सिट" : " seats"}
        </span>
        <span>
          <strong>{progress.counted.toLocaleString()}</strong>
          {ne ? " मत गनिएको" : " votes counted"}
        </span>
        <span className="text-slate-400">
          {ne
            ? `कुल: ${progress.totalVoters.toLocaleString()}`
            : `of ${progress.totalVoters.toLocaleString()} registered`}
        </span>
      </div>
    </div>
  );
}
