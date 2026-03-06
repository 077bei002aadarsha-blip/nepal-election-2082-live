"use client";
import { useContext } from "react";
import { LanguageContext } from "@/app/providers";
import { PARTY_INFO } from "@/lib/mock-data";
import type { Constituency } from "@/lib/types";
import { LiveCounter } from "./LiveCounter";

interface Props {
  constituency: Constituency;
  onSelect?: (id: string) => void;
}

const statusStyles: Record<string, string> = {
  declared: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  counting: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  leading: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  not_started: "bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400",
};

const statusLabel: Record<string, { en: string; ne: string }> = {
  declared: { en: "Declared", ne: "घोषित" },
  counting: { en: "Counting", ne: "मतगणना" },
  leading: { en: "Leading", ne: "अग्रणी" },
  not_started: { en: "Awaiting", ne: "प्रतीक्षारत" },
};

export default function ConstituencyCard({ constituency, onSelect }: Props) {
  const { language } = useContext(LanguageContext);
  const ne = language === "ne";
  const top3 = constituency.candidates.slice(0, 3);

  return (
    <div
      className="rounded-lg border border-slate-200 dark:border-slate-700
        bg-white dark:bg-slate-800 p-3 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect?.(constituency.id)}
    >
      {/* header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-wide uppercase">
            #{constituency.no}
          </span>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
            {ne ? constituency.nameNe : constituency.nameEn}
          </h4>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap
          ${statusStyles[constituency.status] ?? statusStyles.not_started}`}>
          {ne
            ? statusLabel[constituency.status]?.ne
            : statusLabel[constituency.status]?.en}
        </span>
      </div>

      {/* candidates */}
      <div className="space-y-1.5">
        {top3.map((cand, idx) => {
          const party = PARTY_INFO[cand.party];
          return (
            <div key={cand.id} className="flex items-center gap-2">
              {/* rank */}
              {idx === 0 && (
                <span className="text-[10px] w-3 text-yellow-500 font-bold">★</span>
              )}
              {idx > 0 && (
                <span className="text-[10px] w-3 text-slate-300 dark:text-slate-600">{idx + 1}</span>
              )}
              {/* party dot */}
              <span className={`w-2 h-2 rounded-full shrink-0 ${party.bgColor}`} />
              {/* name */}
              <span className={`text-xs flex-1 truncate font-medium
                ${idx === 0 ? "text-slate-800 dark:text-slate-100" : "text-slate-600 dark:text-slate-400"}`}>
                {ne ? cand.name : cand.nameEn}
              </span>
              {/* votes */}
              <span className={`text-xs font-bold tabular-nums
                ${idx === 0 ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}`}>
                <LiveCounter value={cand.votes} label="" />
              </span>
            </div>
          );
        })}
      </div>

      {/* turnout */}
      {constituency.totalVotesCounted > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {ne ? "मतदान" : "Turnout"}: {constituency.turnoutPercentage.toFixed(1)}%
          </span>
          {top3[0] && top3[1] && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              +{(top3[0].votes - top3[1].votes).toLocaleString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
