"use client";

import { useLanguage } from "@/app/providers";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 text-xs font-bold">
      <button
        onClick={() => setLang("en")}
        className={`px-2.5 py-1.5 transition-colors ${
          lang === "en"
            ? "bg-blue-600 text-white"
            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("ne")}
        className={`px-2.5 py-1.5 transition-colors ${
          lang === "ne"
            ? "bg-blue-600 text-white"
            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
        }`}
      >
        ने
      </button>
    </div>
  );
}
