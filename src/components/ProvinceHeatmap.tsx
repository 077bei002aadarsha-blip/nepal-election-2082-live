"use client";

// ProvinceHeatmap.tsx — 7-province visual grid: emoji + leading party + seat progress

import { useContext } from "react";
import { LanguageContext } from "@/app/providers";
import { PARTY_INFO } from "@/lib/mock-data";
import type { ProvinceResult } from "@/lib/types";

interface Props { provinces: ProvinceResult[] }

const PROV_EMOJI: Record<string, string> = {
  koshi:        "🏔️",
  madhesh:      "🌾",
  bagmati:      "🏙️",
  gandaki:      "⛰️",
  lumbini:      "🌄",
  karnali:      "🏞️",
  sudurpaschim: "🌊",
};

export default function ProvinceHeatmap({ provinces }: Props) {
  const { language } = useContext(LanguageContext);
  const ne = language === "ne";

  const scrollToProvince = (id: string) => {
    document.getElementById(`province-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700/40 flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {ne ? "प्रदेश अवस्था" : "Province Status"}
        </h3>
        <span className="text-[10px] text-slate-500">
          {ne ? "क्लिक गरेर जानुहोस्" : "Click to jump"}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-7 divide-x divide-y divide-slate-200 dark:divide-slate-700/30">
        {provinces.map((p) => {
          const info  = PARTY_INFO[p.leadingParty];
          const pct   = p.totalSeats > 0 ? p.seatsReported / p.totalSeats : 0;
          // aggregate votes across all districts → constituencies
          const totalVotes = p.districts.reduce(
            (s, d) => s + d.constituencies.reduce((s2, c) => s2 + c.totalVotesCounted, 0),
            0,
          );
          const shortName = ne
            ? p.nameNe.replace(" प्रदेश", "")
            : p.nameEn.split(" ")[0];

          return (
            <button
              key={p.id}
              onClick={() => scrollToProvince(p.id)}
              className="flex flex-col items-center gap-1.5 px-2 py-3
                hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
              title={ne ? p.nameNe : p.nameEn}
            >
              <span className="text-lg leading-none">{PROV_EMOJI[p.id]}</span>

              {/* Leading-party colour stripe */}
              <div
                className={`w-full h-1 rounded-full ${info?.bgColor ?? "bg-gray-500"}`}
                style={{ opacity: 0.6 + pct * 0.4 }}
              />

              {/* Province short name */}
              <p className="text-[9px] font-bold text-slate-600 dark:text-slate-300 text-center leading-tight">
                {shortName}
              </p>

              {/* Seats declared */}
              <p className={`text-xs font-black leading-none ${info?.textColor ?? "text-gray-400"}`}>
                {p.seatsReported}
                <span className="text-slate-600 font-normal text-[9px]">/{p.totalSeats}</span>
              </p>

              {/* Vote count (K) */}
              {totalVotes > 0 && (
                <p className="text-[9px] text-slate-500 tabular-nums leading-none">
                  {(totalVotes / 1000).toFixed(0)}K
                </p>
              )}

              {/* Progress bar */}
              <div className="w-full h-1 rounded-full bg-slate-200 dark:bg-slate-700/50 overflow-hidden">
                <div
                  className={`h-full rounded-full ${info?.bgColor ?? "bg-gray-500"} transition-all duration-700`}
                  style={{ width: `${pct * 100}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
