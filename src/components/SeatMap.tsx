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

  // Province order matching Nepal HoR layout
  const provinceOrder = [
    "Koshibelt", "Madhesh", "Bagmati", 
    "Gandaki", "Lumbini", 
    "Karnali", "Sudurpashchim"
  ];

  // Flatten seats with proper province/district ordering
  const seats = useMemo(() => {
    const allSeats: {
      id: string;
      name: string;
      nameShort: string;
      color: string;
      status: "declared" | "leading" | "counting";
      province: string;
      provinceIndex: number;
      district: string;
      districtIndex: number;
      constituencyNumber: number;
      votes: number;
      margin: string;
      party: string;
    }[] = [];

    data.provinives.forEach((province, pIndex) => {
      province.districts.forEach((district, dIndex) => {
        district.constituencies.forEach((constituency) => {
          const leader = constituency.candidates.find((c) => c.isWinner) || 
                        constituency.candidates.find((c) => c.leading) || 
                        constituency.candidates[0];
          
          if (!leader) return;

          const partyInfo = PARTY_INFO[leader.party] || { color: "#9ca3af" };
          
          allSeats.push({
            id: constituency.id,
            name: ne ? constituency.nameNe : constituency.nameEn,
            nameShort: constituency.number.toString().padStart(2, '0'),
            color: partyInfo.color,
            status: leader.isWinner ? "declared" : leader.leading ? "leading" : "counting",
            province: province.nameEn,
            provinceIndex: provinceOrder.indexOf(province.nameEn),
            district: district.nameEn,
            districtIndex: dIndex,
            constituencyNumber: constituency.number,
            votes: leader.votes || 0,
            margin: leader.margin || "+0",
            party: leader.party,
          });
        });
      });
    });

    // Sort: Province → District → Constituency Number
    return allSeats.sort((a, b) => {
      if (a.provinceIndex !== b.provinceIndex) return a.provinceIndex - b.provinceIndex;
      if (a.districtIndex !== b.districtIndex) return a.districtIndex - b.districtIndex;
      return a.constituencyNumber - b.constituencyNumber;
    });
  }, [data, ne]);

  // Rectangular grid layout: 14 rows × 12 cols = 168 FPTP seats
  const ROWS = 14;
  const COLS = 12;
  const containerWidth = 680;
  const containerHeight = 520;
  const seatSize = 32;
  const seatSpacing = 42;

  // Province labels (rows 0-2: Koshi/Madhesh, 3-5: Bagmati, etc.)
  const provinceLabels = [
    { row: 0, name: "Koshibelt", seats: 28 },
    { row: 3, name: "Madhesh", seats: 32 }, 
    { row: 5, name: "Bagmati", seats: 37 },
    { row: 8, name: "Gandaki", seats: 18 },
    { row: 10, name: "Lumbini", seats: 26 },
    { row: 12, name: "Karnali", seats: 12 },
    // Sudurpashchim fills remaining
  ];

  const getSeatPosition = (index: number) => {
    const row = Math.floor(index / COLS);
    const col = index % COLS;
    return {
      x: 50 + col * seatSpacing,
      y: 50 + row * seatSpacing,
      row,
      col
    };
  };

  return (
    <div className="my-8 p-8 bg-gradient-to-br from-slate-50/80 to-blue-50/80 dark:from-slate-900/30 dark:to-slate-800/30 rounded-3xl border border-slate-200/50 shadow-2xl">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent tracking-tight">
            {ne ? "प्रतिनिधिसभा सीट वितरण" : "House of Representatives"}
          </h3>
          <p className="text-slate-500 mt-1 font-medium">{ne ? "१६५ फप्टिपी सीटहरू" : "165 FPTP Seats"}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {seats.filter(s => s.status === "declared").length}
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">{ne ? "घोषित" : "Declared"}</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-8 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
        {Object.entries(PARTY_INFO).map(([party, info]) => (
          <div key={party} className="flex items-center gap-2.5 min-w-[80px]">
            <div className="w-5 h-5 rounded-lg shadow-md ring-2 ring-white/50" 
                 style={{ backgroundColor: info.color }} />
            <span className="font-medium text-sm">{ne ? info.nameNe : info.nameEn}</span>
            <span className="text-xs text-slate-400 font-mono">
              {seats.filter(s => s.color === info.color).length}
            </span>
          </div>
        ))}
      </div>

      {/* Seat Grid */}
      <div className="relative mx-auto overflow-hidden rounded-2xl shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-white/30" 
           style={{ width: containerWidth, height: containerHeight }}>
        
        {/* Province Labels */}
        {provinceLabels.map(({ row, name, seats: seatCount }) => (
          <div key={name} 
               className="absolute text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200 px-3 py-1 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-md border"
               style={{ 
                 top: `${50 + row * seatSpacing - 8}px`, 
                 left: '20px',
                 backgroundColor: provinceOrder.indexOf(name) % 2 === 0 ? '#f8fafc' : '#e2e8f0'
               }}>
            {ne ? name.replace('belt', 'ाञ्चल') : name} ({seatCount})
          </div>
        ))}

        {/* Seat Numbers (row headers) */}
        {Array.from({ length: ROWS }, (_, row) => (
          <div key={row} 
               className="absolute right-4 text-xs font-mono text-slate-500 bg-white/70 dark:bg-slate-800/70 px-2 py-1 rounded shadow-sm"
               style={{ top: `${55 + row * seatSpacing}px` }}>
            {row + 1}
          </div>
        ))}

        {/* Seats */}
        {seats.slice(0, ROWS * COLS).map((seat, idx) => {
          const pos = getSeatPosition(idx);
          const isHovered = hoveredSeat === seat.id;
          
          return (
            <div
              key={seat.id}
              className="absolute group cursor-pointer"
              style={{
                left: `${pos.x - seatSize/2}px`,
                top: `${pos.y - seatSize/2}px`,
                width: seatSize,
                height: seatSize,
              }}
              onMouseEnter={() => setHoveredSeat(seat.id)}
              onMouseLeave={() => setHoveredSeat(null)}
              onClick={() => onSeatClick?.(data.provinces.flatMap(p => 
                p.districts.flatMap(d => d.constituencies)
              ).find(c => c.id === seat.id)!)}
            >
              <div 
                className="w-full h-full rounded-lg shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center border-2 group-hover:border-white/50 relative overflow-hidden"
                style={{
                  backgroundColor: isHovered ? '#fbbf24' : seat.color,
                  boxShadow: isHovered 
                    ? "0 10px 30px rgba(251, 191, 36, 0.4), 0 0 0 3px rgba(255,255,255,0.9)" 
                    : "0 4px 16px rgba(0,0,0,0.12)",
                  transform: isHovered ? "scale(1.15)" : "scale(1)",
                }}
              >
                {/* Status indicator */}
                {seat.status === "declared" && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full shadow-sm" />
                )}
                
                {/* Seat number */}
                <span className="font-bold text-xs leading-none drop-shadow-sm">
                  {seat.nameShort}
                </span>
                
                {/* Hover tooltip */}
                {isHovered && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-xl shadow-2xl border border-white/20 min-w-[140px] whitespace-nowrap">
                    <div className="font-bold">{seat.name}</div>
                    <div className="text-emerald-300">{seat.margin}</div>
                    <div className="text-slate-300 text-[10px] mt-0.5">{seat.party}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Grid lines */}
        {Array.from({ length: ROWS + 1 }, (_, i) => (
          <div key={`h-${i}`} 
               className="absolute w-full h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent"
               style={{ top: `${52 + i * seatSpacing}px` }} />
        ))}
        {Array.from({ length: COLS + 1 }, (_, i) => (
          <div key={`v-${i}`} 
               className="absolute h-full w-px bg-gradient-to-b from-transparent via-slate-200/50 to-transparent"
               style={{ left: `${52 + i * seatSpacing}px` }} />
        ))}

        {/* Status badges */}
        <div className="absolute top-4 left-4 text-xs font-mono bg-emerald-500/90 text-white px-3 py-1.5 rounded-full shadow-lg border-2 border-white/50">
          ● {seats.filter(s => s.status === "declared").length} Declared
        </div>
        <div className="absolute top-4 right-4 text-xs font-mono bg-blue-500/90 text-white px-3 py-1.5 rounded-full shadow-lg border-2 border-white/50">
          {Math.round(seats.filter(s => s.party === "RSP").length / seats.length * 100)}% RSP
        </div>
        <div className="absolute bottom-4 left-4 text-xs font-mono bg-slate-500/90 text-white px-3 py-1.5 rounded-full shadow-lg">
          १६५ FPTP Seats • Live
        </div>
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-5 gap-6 mt-8 pt-6 border-t-2 border-slate-200/30 dark:border-slate-700">
        <div className="text-center">
          <div className="text-3xl font-black text-emerald-600">{seats.filter(s => s.status === "declared").length}</div>
          <div className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wide">Declared</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-black text-blue-600">{seats.filter(s => s.party === "RSP").length}</div>
          <div className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wide">रास्वपा</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-black text-orange-600">{seats.length}</div>
          <div className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wide">Total</div>
        </div>
        <div className="text-center border-r pr-3">
          <div className="text-3xl font-black text-purple-600">138</div>
          <div className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wide">Majority</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-black text-indigo-600">
            {Math.ceil(seats.length * 0.6)}
          </div>
          <div className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wide">2/3 Majority</div>
        </div>
      </div>
    </div>
  );
}
