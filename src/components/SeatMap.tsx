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

  // semicircular layout parameters
  const containerWidth = 360;
  const containerHeight = 180;
  const centerX = containerWidth / 2;
  const centerY = containerHeight; // base of semicircle
  const radius = containerWidth * 0.45;

  const positionedSeats = seats.map((s, idx) => {
    const angle = Math.PI * idx / (seats.length - 1); // 0..π
    const x = centerX + radius * Math.cos(angle - Math.PI); // start left
    const y = centerY - radius * Math.sin(angle);
    return { ...s, x, y };
  });

  return (
    <div className="my-6">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
        {ne ? "सीट व्यवस्था" : "Seating Map"}
      </h3>
      <div
        className="relative mx-auto"
        style={{ width: containerWidth, height: containerHeight }}
      >
        {positionedSeats.map((s) => (
          <div
            key={s.id}
            className="absolute w-6 h-6 rounded-full cursor-pointer"
            style={{
              backgroundColor: s.color,
              left: `${s.x - 12}px`,
              top: `${s.y - 12}px`,
            }}
            title={s.name}
          />
        ))}
      </div>
    </div>
  );
}
