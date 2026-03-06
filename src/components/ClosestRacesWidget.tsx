"use client";

// ClosestRacesWidget.tsx — Live-sorted closest battles, click jumps to province

import { useContext, useMemo } from "react";
import { LanguageContext } from "@/app/providers";
import { PARTY_INFO } from "@/lib/mock-data";
import type { ElectionResults } from "@/lib/types";

interface Props { data: ElectionResults }

export default function ClosestRacesWidget({ data }: Props) {
  const { language } = useContext(LanguageContext);
  const ne = language === "ne";

  // Flatten all constituencies, attach provinceId, sort by margin
  const races = useMemo(
    () =>
      data.provinces
        .flatMap((p) =>
          p.districts.flatMap((d) =>
            d.constituencies
              .filter((c) => c.leadingMargin > 0 && c.status !== "not_started")
              .map((c) => ({ c, provinceId: p.id })),
          ),
        )
        .sort((a, b) => a.c.leadingMargin - b.c.leadingMargin)
        .slice(0, 8),
    [data],
  );

  const scrollTo = (provinceId: string) =>
    document
      .getElementById(`province-${provinceId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3 border-b border-slate-200 dark:border-slate-700/40 flex items-center justify-between
          bg-gradient-to-r from-emerald-50/60 dark:from-emerald-950/60 to-slate-50/60 dark:to-slate-900/60"
      >
        <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">
          ⚔️ {ne ? "कडा प्रतिस्पर्धा" : "CLOSEST BATTLES"}
        </h3>
        <span className="text-[10px] text-slate-500">
          {ne ? "न्यूनतम मत अन्तर" : "smallest margin first"}
        </span>
      </div>

      {races.length === 0 ? (
        <div className="px-4 py-8 text-center text-[11px] text-slate-500">
          {ne ? "अहिलेसम्म नजिकको दौड छैन" : "No close races detected yet"}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-700/30">
          {races.map(({ c, provinceId }) => {
            const info = PARTY_INFO[c.leadingParty];

            // Urgency colour based on margin size
            const urgencyClass =
              c.leadingMargin < 100
                ? "text-red-400 bg-red-500/10 border-red-500/30"
                : c.leadingMargin < 300
                ? "text-orange-400 bg-orange-500/10 border-orange-500/30"
                : "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";

            return (
              <button
                key={c.id}
                onClick={() => scrollTo(provinceId)}
                className="w-full flex items-center justify-between px-4 py-2.5
                  hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors text-left group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${info?.bgColor ?? "bg-gray-500"}`}
                  />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                      {ne ? c.nameNe : c.nameEn}
                    </p>
                    <p className={`text-[9px] font-medium ${info?.textColor ?? "text-gray-400"}`}>
                      {ne
                        ? info?.shortNe ?? c.leadingParty
                        : info?.shortEn ?? c.leadingParty}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[11px] font-black px-1.5 py-0.5 rounded border tabular-nums ${urgencyClass}`}
                  >
                    +{c.leadingMargin.toLocaleString("en-IN")}
                  </span>
                  <span className="text-slate-400 dark:text-slate-600 text-[10px] group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors">
                    →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700/40 text-[9px] text-slate-400 dark:text-slate-600 text-right">
        {ne ? "क्लिक गरेर प्रदेशमा जानुहोस्" : "Click any race to jump to province"}
      </div>
    </div>
  );
}
