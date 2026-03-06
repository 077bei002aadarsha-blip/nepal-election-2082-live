"use client";
import { useState, useContext } from "react";
import { LanguageContext } from "@/app/providers";

export default function DisclaimerButton() {
  const [open, setOpen] = useState(false);
  const { language } = useContext(LanguageContext);
  const ne = language === "ne";

  return (
    <>
      {/* floating trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-1.5 rounded-full
          bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200
          dark:border-slate-700 shadow-lg px-4 py-2 text-sm font-semibold
          text-slate-700 dark:text-slate-200 hover:scale-105 transition-transform
          animate-pulse-slow"
      >
        <span className="text-base">ℹ️</span>
        <span>{ne ? "डिस्क्लेमर" : "Disclaimer"}</span>
      </button>

      {/* modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4
            bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6
              border border-slate-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {ne ? "⚠️ महत्त्वपूर्ण सूचना" : "⚠️ Important Notice"}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200
                  text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc pl-4">
              <li>
                {ne
                  ? "यो डाटा ECN (नेपाल निर्वाचन आयोग) बाट प्रत्यक्ष लिइएको हो र हरेक ३० सेकेन्डमा स्वतः अपडेट हुन्छ।"
                  : "Data is fetched live from Election Commission Nepal (ECN) and auto-updates every 30 seconds."}
              </li>
              <li>
                {ne
                  ? "आधिकारिक नतिजाका लागि ECN वेबसाइट (election.gov.np) हेर्नुहोस्।"
                  : "For official results always refer to ECN directly at election.gov.np."}
              </li>
              <li>
                {ne
                  ? "यो साइट ECN सँग आधिकारिक रूपमा सम्बद्ध छैन — डाटा स्वतन्त्र रूपमा प्रदर्शन गरिएको हो।"
                  : "This site is not officially affiliated with ECN — data is displayed independently."}
              </li>
              <li>
                {ne
                  ? "कुनै पनि महत्त्वपूर्ण निर्णयका लागि यो साइट जिम्मेवार छैन।"
                  : "This site is not responsible for decisions made based on this data."}
              </li>
            </ul>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>{ne ? "स्रोत: ECN | नेपाल निर्वाचन आयोग" : "Source: ECN — Nepal Election Commission"}</span>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700
                text-white font-semibold text-sm transition-colors"
            >
              {ne ? "बुझें" : "Got it"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
