"use client";
import { useState, useMemo, useContext } from "react";
import { LanguageContext } from "@/app/providers";
import { PARTY_INFO } from "@/lib/mock-data";
import { getStatusBadge } from "@/lib/ecn-parser";
import type { ProvinceResult, Constituency } from "@/lib/types";

interface Props { provinces: ProvinceResult[] }

type Hit = Constituency & { provinceName: string; districtName: string };

export default function SearchBar({ provinces }: Props) {
  const [query, setQuery] = useState("");
  const { language } = useContext(LanguageContext);
  const ne = language === "ne";

  const all = useMemo<Hit[]>(() => {
    return provinces.flatMap((p) =>
      p.districts.flatMap((d) =>
        d.constituencies.map((c) => ({
          ...c,
          provinceName: ne ? p.nameNe : p.nameEn,
          districtName: ne ? d.nameNe : d.nameEn,
        }))
      )
    );
  }, [provinces, ne]);

  const hits = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return all.filter(
      (c) =>
        c.nameEn.toLowerCase().includes(q) ||
        c.nameNe.includes(q) ||
        c.districtName.toLowerCase().includes(q) ||
        c.provinceName.toLowerCase().includes(q) ||
        PARTY_INFO[c.leadingParty]?.nameEn.toLowerCase().includes(q) ||
        PARTY_INFO[c.leadingParty]?.nameNe.includes(q)
    ).slice(0, 8);
  }, [query, all]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={ne
            ? "निर्वाचन क्षेत्र, जिल्ला, पार्टी खोज्नुहोस्..."
            : "Search constituency, district, party..."}
          className="w-full pl-11 pr-10 py-3.5 rounded-xl bg-white dark:bg-slate-800
            border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100
            placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2
            focus:ring-blue-500 shadow-sm"
        />
        {query && (
          <button onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {hits.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800
          rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
          {hits.map((c) => {
            const partyInfo = PARTY_INFO[c.leadingParty];
            const badge = getStatusBadge(c.status);
            return (
              <a key={c.id} href={`/results/${c.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50
                  dark:hover:bg-slate-700/50 transition-colors border-b last:border-0
                  border-slate-100 dark:border-slate-700/50">
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">
                    {ne ? c.nameNe : c.nameEn}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {c.districtName} · {c.provinceName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white px-2 py-0.5 rounded"
                    style={{ background: partyInfo?.color ?? "#6b7280" }}>
                    {ne ? partyInfo?.shortNe : partyInfo?.nameEn.split(" ")[0]}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${badge.color}`}>
                    {ne ? badge.labelNe : badge.label}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {query && hits.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800
          rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50
          px-4 py-6 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {ne
              ? `"${query}" को लागि कुनै नतिजा भेटिएन`
              : `No results for "${query}"`}
          </p>
        </div>
      )}
    </div>
  );
}
