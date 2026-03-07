"use client";

import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LanguageContext } from "./providers";
import type { ElectionResults } from "@/lib/types";

import HeroDashboard from "@/components/HeroDashboard";
import ProvinceTabCarousel from "@/components/ProvinceTabCarousel";
import ProvinceCard from "@/components/ProvinceCard";
import NationalSummary from "@/components/NationalSummary";
import SeatMap from "@/components/SeatMap";
import PartyBarChart from "@/components/PartyBarChart";
import ProvinceHeatmap from "@/components/ProvinceHeatmap";
import LiveTrendsCarousel from "@/components/LiveTrendsCarousel";
import ClosestRacesWidget from "@/components/ClosestRacesWidget";
import CountdownWidget from "@/components/CountdownWidget";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import DisclaimerButton from "@/components/DisclaimerButton";
import { LiveDot } from "@/components/LiveIndicators";

async function fetchResults(): Promise<ElectionResults> {
  const res = await fetch("/api/scrape", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch election data");
  return res.json();
}

export default function HomePage() {
  const { language } = useContext(LanguageContext);
  const ne = language === "ne";
  const [activeProvince, setActiveProvince] = useState<string | undefined>(undefined);

  const { data, isLoading, error, dataUpdatedAt } = useQuery<ElectionResults>({
    queryKey: ["electionResults"],
    queryFn: fetchResults,
    refetchInterval: 30_000,
    staleTime: 25_000,
    refetchIntervalInBackground: true,
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">

      {/* â”€â”€ STICKY HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-700/60
        bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <LiveDot />
            <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-slate-100 truncate">
              {ne ? "नेपाल चुनाव २०८२ | लाइभ नतिजा" : "Nepal Election 2082 | LIVE Results"}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {dataUpdatedAt > 0 && (
              <span className="hidden sm:inline text-[10px] text-slate-500 font-mono mr-1">
                {ne ? "अपडेट" : "updated"} {new Date(dataUpdatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4 space-y-4">

        {/* â”€â”€ TOP AD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {data && <LiveTrendsCarousel data={data} />}

        {/* â”€â”€ LOADING STATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {isLoading && !data && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
              <div className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-slate-400 text-sm font-medium">
              {ne ? "ECN बाट डेटा लोड हुँदैछ..." : "Loading live data from ECN..."}
            </p>
          </div>
        )}

        {/* â”€â”€ ERROR STATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {error && !data && (
          <div className="rounded-xl bg-red-950/40 border border-red-500/30 px-5 py-5 text-center">
            <p className="text-red-400 font-bold mb-1">
              {ne ? "डेटा लोड गर्न सकिएन" : "Could not load results"}
            </p>
            <p className="text-red-400/60 text-xs">
              {ne ? "पुनः प्रयास गर्नुहोस् वा election.gov.np हेर्नुहोस्" : "Please try again or visit election.gov.np"}
            </p>
          </div>
        )}

        {data && (
          <>
            {/* SEO: keyword-rich heading — read by Google, invisible to sighted users */}
            <h2 className="sr-only">
              Nepal Election Result 2082 LIVE — चुनाव नतिजा २०८२ — All 165 Constituencies,
              Vote Counts from Election Commission Nepal (ECN). RSP, NC, UML, Maoist seat tally.
            </h2>            {/* â”€â”€ CNN-LEVEL HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <HeroDashboard data={data} />

            {/* â”€â”€ NATIONAL PARTY SUMMARY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <NationalSummary data={data} />
            <SeatMap data={data} />

            {/* Charts: vote share bars + province heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <PartyBarChart data={data} />
              <ProvinceHeatmap provinces={data.provinces} />
            </div>

            {/* â”€â”€ MID AD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <ClosestRacesWidget data={data} />

            {/* â”€â”€ PROVINCE SECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  {ne ? "प्रदेश अनुसार नतिजा" : "Results by Province"}
                </h2>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                  {ne ? "▼ क्लिक गरेर خोल्नुहोस्" : "▼ Click to expand"}
                </span>
              </div>

              {/* Sticky province tabs */}
              <ProvinceTabCarousel
                provinces={data.provinces}
                activeId={activeProvince}
                onSelect={setActiveProvince}
              />

              {/* Province cards */}
              <div className="space-y-3 mt-3">
                {data.provinces.map((p) => (
                  <ProvinceCard key={p.id} province={p} />
                ))}
              </div>
            </section>

            {/* â”€â”€ BOTTOM AD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <CountdownWidget data={data} />


          </>
        )}
      </main>

      <DisclaimerButton />
    </div>
  );
}
