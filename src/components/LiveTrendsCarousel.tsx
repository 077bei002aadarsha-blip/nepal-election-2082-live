"use client";

// LiveTrendsCarousel.tsx — 728×90 live ticker: auto-rotates every 8s via Framer Motion

import { useState, useEffect, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LanguageContext } from "@/app/providers";
import { PARTY_INFO } from "@/lib/mock-data";
import type { ElectionResults } from "@/lib/types";

interface TrendItem {
  icon: string;
  textNe: string;
  textEn: string;
  accent: string; // Tailwind text-color class
}

function buildTrends(data: ElectionResults): TrendItem[] {
  const items: TrendItem[] = [];
  const allConsts = data.provinces.flatMap((p) =>
    p.districts.flatMap((d) => d.constituencies),
  );

  // 1. Declared seats (top 3)
  for (const c of allConsts.filter((c) => c.status === "declared").slice(0, 3)) {
    const winner = c.candidates.find((x) => x.isWinner) ?? c.candidates.find((x) => x.isLeading);
    if (!winner) continue;
    const info = PARTY_INFO[winner.party];
    items.push({
      icon: "✓",
      textNe: `${c.nameNe}: ${winner.name} (${info?.shortNe ?? winner.party}) विजेता घोषित`,
      textEn: `${c.nameEn}: ${winner.nameEn ?? winner.name} (${info?.shortEn ?? winner.party}) DECLARED`,
      accent: info?.textColor ?? "text-emerald-400",
    });
  }

  // 2. Knife-edge races (margin < 1 000)
  const close = allConsts
    .filter((c) => c.leadingMargin > 0 && c.leadingMargin < 1000 && c.status !== "not_started")
    .sort((a, b) => a.leadingMargin - b.leadingMargin)
    .slice(0, 3);
  for (const c of close) {
    const info = PARTY_INFO[c.leadingParty];
    items.push({
      icon: "⚔️",
      textNe: `${c.nameNe}: ${info?.shortNe ?? c.leadingParty} केवल +${c.leadingMargin.toLocaleString("en-IN")} मतले अग्रणी`,
      textEn: `${c.nameEn}: ${info?.shortEn ?? c.leadingParty} leads by only +${c.leadingMargin.toLocaleString("en-IN")} votes`,
      accent: "text-yellow-400",
    });
  }

  // 3. Province front-runners (first 2 with seats)
  for (const p of data.provinces.filter((p) => p.seatsReported > 0).slice(0, 2)) {
    const info = PARTY_INFO[p.leadingParty];
    items.push({
      icon: "🏆",
      textNe: `${p.nameNe}: ${info?.shortNe ?? p.leadingParty} ${p.seatsReported} सिटमा अग्रणी`,
      textEn: `${p.nameEn}: ${info?.shortEn ?? p.leadingParty} leads in ${p.seatsReported} seats`,
      accent: info?.textColor ?? "text-purple-400",
    });
  }

  // 4. Overall progress (always included)
  items.push({
    icon: "📊",
    textNe: `${data.seatsReported}/१६५ सिट घोषणा · ${data.totalVotesCounted.toLocaleString("en-IN")} मत गणना (${data.progress.percentage.toFixed(0)}%)`,
    textEn: `${data.seatsReported}/165 seats declared · ${data.totalVotesCounted.toLocaleString("en-IN")} votes counted (${data.progress.percentage.toFixed(0)}%)`,
    accent: "text-blue-400",
  });

  if (items.length === 0) {
    items.push({
      icon: "🔴",
      textNe: "मतगणना सुरु भएको छ — नतिजाहरू प्रतीक्षा गर्नुहोस्",
      textEn: "Counting underway — results arriving live from ECN",
      accent: "text-red-400",
    });
  }

  return items;
}

export default function LiveTrendsCarousel({ data }: { data: ElectionResults }) {
  const { language } = useContext(LanguageContext);
  const ne = language === "ne";
  const trends = buildTrends(data);
  const [idx, setIdx] = useState(0);

  // Auto-advance every 8 seconds
  useEffect(() => {
    if (trends.length <= 1) return;
    const timer = setInterval(() => setIdx((i) => (i + 1) % trends.length), 8000);
    return () => clearInterval(timer);
  }, [trends.length]);

  const current = trends[idx] ?? trends[0];
  if (!current) return null;

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden
        bg-gradient-to-r from-indigo-100 via-purple-50 to-slate-50 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-900
        border border-indigo-200 dark:border-indigo-700/40 h-[90px] flex flex-col justify-between px-4 py-2.5"
    >
      {/* Header: live badge + dot navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {ne ? "ताजा खबर" : "LIVE TRENDS"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {trends.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === idx ? "w-4 bg-indigo-500 dark:bg-indigo-400" : "w-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Animated trend text */}
      <div className="flex-1 flex items-center min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 w-full"
          >
            <span className="text-sm leading-none shrink-0">{current.icon}</span>
            <span className={`text-sm font-bold leading-tight ${current.accent} line-clamp-2`}>
              {ne ? current.textNe : current.textEn}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-slate-400 dark:text-slate-600">ECN · result.election.gov.np</span>
        <span className="text-[9px] text-slate-400 dark:text-slate-600">
          {idx + 1}/{trends.length}
        </span>
      </div>
    </div>
  );
}
