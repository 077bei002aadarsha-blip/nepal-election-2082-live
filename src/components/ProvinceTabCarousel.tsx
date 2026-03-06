"use client";

// ProvinceTabCarousel.tsx — Sticky scrollable province tabs with seat counts

import { useRef, useContext } from "react";
import { LanguageContext } from "@/app/providers";
import { PARTY_INFO } from "@/lib/mock-data";
import type { ProvinceResult } from "@/lib/types";

interface Props {
  provinces: ProvinceResult[];
  activeId?: string;
  onSelect?: (id: string) => void;
}

export default function ProvinceTabCarousel({ provinces, activeId, onSelect }: Props) {
  const { language } = useContext(LanguageContext);
  const ne = language === "ne";
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollTo = (id: string) => {
    if (onSelect) {
      onSelect(id);
    } else {
      // Default: scroll to section with matching id
      const el = document.getElementById(`province-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    // Scroll the tab itself into view
    const tabEl = document.getElementById(`tab-${id}`);
    if (tabEl && scrollRef.current) {
      const container = scrollRef.current;
      const tabLeft = tabEl.offsetLeft - container.offsetLeft;
      const tabRight = tabLeft + tabEl.offsetWidth;
      const containerWidth = container.offsetWidth;
      if (tabLeft < container.scrollLeft) {
        container.scrollTo({ left: tabLeft - 8, behavior: "smooth" });
      } else if (tabRight > container.scrollLeft + containerWidth) {
        container.scrollTo({ left: tabRight - containerWidth + 8, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="sticky top-[57px] z-30 bg-slate-900/95 backdrop-blur-sm
      border-b border-slate-700/50 -mx-4 px-4">
      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto scrollbar-hide py-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
      >
        {provinces.map((prov) => {
          const isActive = activeId === prov.id;
          const info = PARTY_INFO[prov.leadingParty];
          const seatsText = `${prov.seatsReported}/${prov.totalSeats}`;

          return (
            <button
              id={`tab-${prov.id}`}
              key={prov.id}
              onClick={() => scrollTo(prov.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold
                whitespace-nowrap transition-all shrink-0 border
                ${isActive
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                  : "bg-slate-800/60 text-slate-300 border-slate-700/50 hover:bg-slate-700/60 hover:text-slate-100"
                }`}
            >
              {/* Leading party dot */}
              <span className={`w-2 h-2 rounded-full ${info?.bgColor ?? "bg-gray-500"}`} />
              {/* Province name (short) */}
              <span>{ne ? shortNe(prov.id) : shortEn(prov.nameEn)}</span>
              {/* Seat ratio */}
              <span className={`font-normal text-[10px]
                ${isActive ? "text-blue-200" : "text-slate-500"}`}>
                {seatsText}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function shortEn(name: string): string {
  const map: Record<string, string> = {
    "Koshi Province": "Koshi",
    "Madhesh Province": "Madhesh",
    "Bagmati Province": "Bagmati",
    "Gandaki Province": "Gandaki",
    "Lumbini Province": "Lumbini",
    "Karnali Province": "Karnali",
    "Sudurpashchim Province": "Sudurpaschim",
  };
  return map[name] ?? name.split(" ")[0];
}

function shortNe(id: string): string {
  const map: Record<string, string> = {
    koshi: "कोशी",
    madhesh: "मधेश",
    bagmati: "बागमती",
    gandaki: "गण्डकी",
    lumbini: "लुम्बिनी",
    karnali: "कर्णाली",
    sudurpaschim: "सुदूरपश्चिम",
  };
  return map[id] ?? id;
}
