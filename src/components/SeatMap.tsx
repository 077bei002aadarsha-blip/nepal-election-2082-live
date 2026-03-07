"use client";

import { useContext, useMemo, useState } from "react";
import { LanguageContext } from "@/app/providers";
import type { ElectionResults, Constituency } from "@/lib/types";
import { PARTY_INFO } from "@/lib/mock-data";

interface Props {
  data: ElectionResults;
  onSeatClick?: (constituency: Constituency) => void;
}

export default function SeatMap({ data, onSeatClick }: Props) {
  const { language } = useContext(LanguageContext);
  const ne = language === "ne";
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  // Province/District order (matching Nepal HoR layout)
  const provinceOrder = [
    "Koshibelt",
    "Madhesh",
    "Bagmati", 
    "Gandaki",
    "Lumbini",
    "Karnali",
    "Sudurpashchim"
  ];

  // Flatten + prioritize declared/winning seats
  const seats = useMemo(() => {
    const allSeats: {
      id: string;
      name: string;
      nameShort: string;
      color: string;
      status: "leading" | "declared" | "counting";
      province: string;
      votes: number;
      margin: string;
    }[] = [];

    data.provinces.forEach((province) => {
      province.districts.forEach((district) => {
        district.constituencies.forEach((constituency) => {
          const leader = constituency.candidates.find((c) => c.isWinner) || 
                        constituency.candidates.find((c) => c.leading) || 
                        constituency.candidates[0];
          
          if (!leader) return;

          const partyInfo = PARTY_INFO[leader.party] || { color: "#9ca3af" };
          
          seats.push({
            id: constituency.id,
            name: ne ? constituency.nameNe : constituency.nameEn,
            nameShort: constituency.number.toString(),
            color: partyInfo.color,
            status: leader.isWinner ? "declared" : "leading",
            province: province.nameEn,
            votes: leader.votes || 0,
            margin: leader.margin || "+0",
          });
        });
      });
    });

    // Sort: Declared first → Leading → Province order → Number
    return seats.sort((a, b) => {
      if (a.status !== b.status) return a.status === "declared" ? -1 : 1;
      return provinceOrder.indexOf(a.province) - provinceOrder.indexOf(b.province);
    });
  }, [data, ne]);

  // US Senate-style layout: 4 rows × 8 cols (32 seats demo) + leadership positions
  const ROWS = 8;
  const COLS = 10;
  const containerWidth = 600;
  const containerHeight = 400;
  const seatSize = 28;
  const seatSpacing = 45;

  const getSeatPosition = (index: number) => {
    const row = Math.floor(index / COLS);
    const col = index % COLS;
    
    // Senate-style curve: middle rows slightly curved
    const baseX = 60 + col * seatSpacing;
    const baseY = 40 + row * seatSpacing;
    
    // Curve center seats
    const curve = row === 3 || row === 4 ? Math.sin((col - 4.5) * 0.3) * 8 : 0;
    
    return {
      x: baseX + curve,
      y: baseY,
      row,
      col
    };
  };

  const getSeatStyle = (seat: any, isHovered: boolean) => ({
    background: isHovered 
      ? "linear-gradient(135deg, #fbbf24, #f59e0b)" 
      : seat.color,
    boxShadow: isHovered 
      ? "0 8px 25px rgba(251, 191, 36, 0.4), 0 0 0 2px rgba(255,255,255,0.8)" 
      : "0 4px 12px rgba(0,0,0,0.15)",
    transform: isHovered ? "scale(1.2) translateZ(0)" : "scale(1)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
  });

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
          {ne ? "प्रतिनिधिसभा सीट नक्सा" : "House of Representatives Seat Map"}
        </h3>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {seats.filter(s => s.status === "declared").length}/{seats.length} declared
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6 px-2">
        {Object.entries(PARTY_INFO).map(([party, info]) => (
          <div key={party} className="flex items-center gap-2 text-sm">
            <div 
              className="w-4 h-4 rounded-full ring-2 ring-slate-200 dark:ring-slate-700" 
              style={{ backgroundColor: info.color }}
            />
            <span>{ne ? info.nameNe : info.nameEn}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span>Counting</span>
        </div>
      </div>

      {/* Interactive Seat Grid */}
      <div 
        className="relative mx-auto cursor-crosshair"
        style={{ width: containerWidth, height: containerHeight }}
      >
        {/* Leadership positions (center top - like VP/President seats) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-4 flex gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-yellow-600 rounded-full shadow-xl border-4 border-white/80" />
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-2xl border-4 border-white/80" />
        </div>

        {/* Main seat grid */}
        {seats.slice(0, ROWS * COLS).map((seat, idx) => {
          const pos = getSeatPosition(idx);
          const isHovered = hoveredSeat === seat.id;
          
          return (
            <div
              key={seat.id}
              className="absolute group cursor-pointer select-none"
              style={{
                left: `${pos.x - seatSize/2}px`,
                top: `${pos.y - seatSize/2}px`,
                width: seatSize,
                height: seatSize,
              }}
              onMouseEnter={() => setHoveredSeat(seat.id)}
              onMouseLeave={() => setHoveredSeat(null)}
              onClick={() => onSeatClick?.(data.provinces.flatMap(p => p.districts.flatMap(d => d.constituencies)).find(c => c.id === seat.id)!)}
            >
              <div 
                className="w-full h-full rounded-xl shadow-md hover:shadow-2xl transition-all duration-200 flex items-center justify-center"
                style={getSeatStyle(seat, isHovered)}
              >
                {isHovered && (
                  <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                    {seat.nameShort} • {seat.margin}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Seat count badges (corners) */}
        <div className="absolute top-2 left-4 text-xs font-mono bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded-lg shadow-md">
          {seats.length} seats
        </div>
        <div className="absolute bottom-2 right-4 text-xs font-mono bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded-lg shadow-md">
          Live • 3:26 PM
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{seats.filter(s => s.status === "declared").length}</div>
          <div className="text-xs text-slate-500 uppercase tracking-wide">Declared</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {Math.round(seats.filter(s => PARTY_INFO[s.color]?.nameEn === "RSP").length / seats.length * 100)}%
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wide">RSP Share</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{seats.length}</div>
          <div className="text-xs text-slate-500 uppercase tracking-wide">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {Math.round((138 / seats.length) * 100)}%
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wide">Majority</div>
        </div>
      </div>
    </div>
  );
}
