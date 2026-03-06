"use client";
import { useState, useContext } from "react";
import { LanguageContext } from "@/app/providers";
import { PARTY_INFO } from "@/lib/mock-data";
import type { ProvinceResult } from "@/lib/types";
import CandidateBattleCard from "./CandidateBattleCard";

interface Props {
  province: ProvinceResult;
}

export default function ProvinceCard({ province }: Props) {
  const { language } = useContext(LanguageContext);
  const ne = language === "ne";
  const [expanded, setExpanded] = useState(false);
  const [openDistricts, setOpenDistricts] = useState<Set<string>>(new Set());

  const toggleDistrict = (id: string) =>
    setOpenDistricts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const topParty = PARTY_INFO[province.leadingParty];

  const seatsArray = Object.entries(province.partySeats)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
    .slice(0, 5);

  const totalVotes = province.totalVotes;
  const declaredCount = province.seatsReported;
  const totalConsts = province.districts.reduce((s, d) => s + d.constituencies.length, 0);
  const countingCount = province.districts
    .flatMap((d) => d.constituencies)
    .filter((c) => c.status === "counting").length;

  return (
    <div
      id={`province-${province.id}`}
      className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 overflow-hidden shadow-md"
    >
      {/* Province header */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3.5
          bg-slate-100 dark:bg-slate-700/40 hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${topParty.bgColor} shadow-lg`} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {ne ? "प्रदेश" : "Province"}
            </p>
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-base leading-tight">
              {ne ? province.nameNe : province.nameEn}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Seat badges */}
          <div className="hidden sm:flex gap-1 flex-wrap justify-end max-w-[200px]">
            {seatsArray.map(([pc, seats]) => seats && seats > 0 && (
              <span
                key={pc}
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white
                  ${PARTY_INFO[pc as keyof typeof PARTY_INFO]?.bgColor ?? "bg-gray-400"}`}
              >
                {PARTY_INFO[pc as keyof typeof PARTY_INFO]?.shortNe ?? pc}: {seats}
              </span>
            ))}
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs font-black text-slate-700 dark:text-slate-200">
              {declaredCount}/{province.totalSeats}
            </div>
            <div className="text-[9px] text-slate-500">
              {ne ? "घोषित" : "declared"}
            </div>
          </div>
          <span className={`transition-transform duration-200 text-slate-500 dark:text-slate-400 text-xs
            ${expanded ? "rotate-180" : ""}`}>▼</span>
        </div>
      </button>

      {/* Stats strip */}
      <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700/30
        text-[10px] text-slate-500 dark:text-slate-400">
        <span>
          <span className="text-yellow-400 font-bold">{countingCount}</span>
          {" "}{ne ? "गणना जारी" : "counting"}
        </span>
        <span>
          <span className="text-emerald-400 font-bold">{declaredCount}</span>
          {" "}{ne ? "घोषित" : "declared"}
        </span>
        <span>
          <span className="text-slate-700 dark:text-slate-300 font-bold">{totalConsts}</span>
          {" "}{ne ? "कुल क्षेत्र" : "constituencies"}
        </span>
        {totalVotes > 0 && (
          <span className="ml-auto">
            <span className="text-amber-400 font-bold">{totalVotes.toLocaleString("en-IN")}</span>
            {" "}{ne ? "मत" : "votes"}
          </span>
        )}
      </div>

      {/* Districts accordion */}
      {expanded && (
        <div className="divide-y divide-slate-100 dark:divide-slate-700/30">
          {province.districts.map((district) => {
            const distOpen = openDistricts.has(district.id);
            const distDeclared = district.constituencies.filter((c) => c.status === "declared").length;
            const distCounting = district.constituencies.filter((c) => c.status === "counting").length;

            return (
              <div key={district.id}>
                {/* District header */}
                <button
                  onClick={() => toggleDistrict(district.id)}
                  className="w-full flex items-center justify-between px-5 py-3
                    hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {ne ? district.nameNe : district.nameEn}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {district.constituencies.length} {ne ? "क्षेत्र" : "constituencies"}
                        {distDeclared > 0 && (
                          <span className="ml-2 text-emerald-400 font-bold">
                            {distDeclared} {ne ? "घोषित" : "declared"}
                          </span>
                        )}
                        {distCounting > 0 && (
                          <span className="ml-2 text-yellow-400 font-bold">
                            {distCounting} {ne ? "गणना जारी" : "counting"}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {distDeclared > 0 && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400
                        border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-bold">
                        ✓ {distDeclared}
                      </span>
                    )}
                    <span className={`text-slate-500 dark:text-slate-400 text-xs transition-transform duration-200
                      ${distOpen ? "rotate-180" : ""}`}>▼</span>
                  </div>
                </button>

                {/* Constituency battle cards */}
                {distOpen && (
                  <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 pt-1">
                    {district.constituencies.map((con) => (
                      <CandidateBattleCard key={con.id} constituency={con} compact />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
