"use client";

import { useContext } from "react";
import { LanguageContext } from "@/app/providers";
import type { ElectionResults, Constituency } from "@/lib/types";
import { PARTY_INFO } from "@/lib/mock-data";

interface Props {
  data: ElectionResults;
}

export default function SeatMap({ data }: Props) {
  const { language } = useContext(LanguageContext);
  const ne = language === "ne";

  // flatten constituencies with color and order by province/district/number
  const seats: { id: string; name: string; color: string }[] = [];
  data.provinces.forEach((p) =>
    p.districts.forEach((d) =>
      d.constituencies.forEach((c) => {
        const winner = c.candidates.find((x) => x.isWinner) || c.candidates[0];
        const info = PARTY_INFO[winner?.party];
        seats.push({
          id: c.id,
          name: ne ? `${c.nameNe}` : `${c.nameEn}`,
          color: info?.color ?? "#9ca3af",
        });
      })
    )
  );

  return (
    <div className="my-6">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
        {ne ? "सीट व्यवस्था" : "Seating Map"}
      </h3>
      <div className="grid grid-cols-15 gap-1 justify-center">
        {seats.map((s, idx) => (
          <div
            key={s.id}
            className="w-6 h-6 rounded-full cursor-pointer"
            style={{ backgroundColor: s.color }}
            title={s.name}
          />
        ))}
      </div>
    </div>
  );
}
