"use client";

import { useContext } from "react";
import { LanguageContext } from "@/app/providers";

export default function Footer() {
  const { language } = useContext(LanguageContext);
  const ne = language === "ne";
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm mt-8">
      <div className="max-w-6xl mx-auto px-4 py-5 space-y-3">

        {/* Data source + disclaimer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-base leading-none">📊</span>
            <span>
              {ne
                ? "डाटा स्रोत: नेपाल निर्वाचन आयोग (result.election.gov.np) · हरेक ३० सेकेन्डमा अपडेट"
                : "Data: Election Commission Nepal (result.election.gov.np) · Updates every 30 seconds"}
            </span>
          </div>
          <span className="text-emerald-500/80 font-medium shrink-0">
            {ne ? "सूचना उद्देश्यका लागि मात्र" : "For information purposes only"}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-800/50" />

        {/* Developer credit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-slate-500">
          <span>
            © {year} NepalElectionLive ·{" "}
            {ne ? "बनाएका:" : "Built by"}{" "}
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Aadarsha Thapa Magar</span>
          </span>
          <a
            href="mailto:thapamagaraadarsha97@gmail.com"
            className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors font-medium"
          >
            thapamagaraadarsha97@gmail.com
          </a>
        </div>

      </div>
    </footer>
  );
}
