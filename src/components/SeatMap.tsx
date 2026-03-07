"use client";

import { useContext, useMemo, useState } from "react";
import { LanguageContext } from "@/app/providers";
import type { ElectionResults, Constituency, PartyCode } from "@/lib/types";
import { PARTY_INFO } from "@/lib/mock-data";

interface Props {
  data: ElectionResults;
  onSeatClick?: (constituency: Constituency) => void;
}

function computeArcPositions(total: number, cx: number, cy: number, numRows = 9) {
  const minAngle = Math.PI * 0.08;
  const maxAngle = Math.PI * 0.92;
  const minRadius = 100;
  const radiusStep = 36;

  const rowCounts: number[] = [];
  let remaining = total;
  for (let r = 0; r < numRows; r++) {
    const base = Math.floor(total / numRows);
    const count =
      r === numRows - 1
        ? remaining
        : Math.min(Math.round(base * (0.6 + r * 0.07)), remaining);
    rowCounts.push(count);
    remaining -= count;
    if (remaining <= 0) break;
  }

  const positions: { x: number; y: number; row: number }[] = [];
  for (let r = 0; r < rowCounts.length; r++) {
    const count = rowCounts[r];
    const radius = minRadius + r * radiusStep;
    for (let s = 0; s < count; s++) {
      const angle =
        count === 1
          ? (minAngle + maxAngle) / 2
          : minAngle + (s / (count - 1)) * (maxAngle - minAngle);
      positions.push({
        x: cx + radius * Math.cos(Math.PI - angle),
        y: cy - radius * Math.sin(angle),
        row: r,
      });
    }
  }
  return positions;
}

export default function SeatMap({ data, onSeatClick }: Props) {
  const { language } = useContext(LanguageContext);
  const ne = language === "ne";
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);
  const [filterParty, setFilterParty] = useState<string | null>(null);

  const W = 860, H = 500;
  const cx = W / 2, cy = H - 20;

  const seats = useMemo(() => {
    const allSeats: {
      id: string;
      number: number;
      name: string;
      color: string;
      status: "declared" | "leading" | "counting";
      party: string;
      margin: string;
      province: string;
    }[] = [];

    data.provinces.forEach((province) => {
      province.districts.forEach((district) => {
        district.constituencies.forEach((constituency) => {
          const leader =
            constituency.candidates.find((c) => c.isWinner) ||
            constituency.candidates.find((c) => c.isLeading) ||
            constituency.candidates[0];
          if (!leader) return;
          const partyInfo = PARTY_INFO[leader.party] || { color: "#9ca3af" };
          allSeats.push({
            id: constituency.id,
            number: constituency.no,
            name: ne ? constituency.nameNe : constituency.nameEn,
            color: partyInfo.color,
            status: leader.isWinner ? "declared" : leader.isLeading ? "leading" : "counting",
            party: leader.party,
            margin: leader.leadBy != null ? `+${leader.leadBy}` : "+0",
            province: ne ? province.nameNe : province.nameEn,
          });
        });
      });
    });
    return allSeats;
  }, [data, ne]);

  const positions = useMemo(() => computeArcPositions(seats.length, cx, cy, 9), [seats.length, cx, cy]);

  const declared = seats.filter((s) => s.status === "declared").length;
  const leading  = seats.filter((s) => s.status === "leading").length;

  const partyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    seats.forEach((s) => { counts[s.party] = (counts[s.party] || 0) + 1; });
    return counts;
  }, [seats]);

  const hovered = hoveredSeat ? seats.find((s) => s.id === hoveredSeat) : null;

  return (
    <div className="my-6 rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl"
      style={{ background: "linear-gradient(160deg, #0d1b2a 0%, #1a2d42 60%, #0d1b2a 100%)" }}>

      {/* Header */}
      <div className="px-8 pt-6 pb-4 border-b border-slate-700/40">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs tracking-widest text-slate-500 uppercase mb-1" style={{ fontFamily: "Georgia, serif" }}>
              Federal Parliament of Nepal
            </p>
            <h2 className="text-2xl font-bold text-slate-100" style={{ fontFamily: "Georgia, serif" }}>
              {ne ? "प्रतिनिधिसभा सिट नक्शा" : "House of Representatives — Seat Map"}
            </h2>
            <p className="text-xs text-slate-500 mt-1 tracking-widest uppercase">
              {seats.length} FPTP Constituencies · Semicircular Layout
            </p>
          </div>
          <div className="flex gap-6">
            {[
              { label: ne ? "घोषित" : "Declared",  value: declared,                        color: "#4ade80" },
              { label: ne ? "अग्रणी" : "Leading",   value: leading,                         color: "#60a5fa" },
              { label: ne ? "जम्मा" : "Total",      value: seats.length,                    color: "#e2e8f0" },
              { label: ne ? "बहुमत" : "Majority",   value: Math.ceil(seats.length / 2) + 1, color: "#facc15" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-black" style={{ color }}>{value}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Party filter */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={() => setFilterParty(null)}
            className="px-3 py-1 rounded-full text-xs transition-all"
            style={{
              border: filterParty === null ? "1.5px solid #e2e8f0" : "1.5px solid #334155",
              background: filterParty === null ? "#e2e8f0" : "transparent",
              color: filterParty === null ? "#0d1b2a" : "#64748b",
              fontFamily: "Georgia, serif",
            }}>
            {ne ? "सबै दल" : "All Parties"}
          </button>
          {Object.entries(PARTY_INFO).map(([key, info]) => {
            const count = partyCounts[key] || 0;
            if (!count) return null;
            const active = filterParty === key;
            return (
              <button key={key} onClick={() => setFilterParty(active ? null : key)}
                className="px-3 py-1 rounded-full text-xs flex items-center gap-1.5 transition-all"
                style={{
                  border: `1.5px solid ${active ? info.color : "#334155"}`,
                  background: active ? info.color : "transparent",
                  color: active ? "#fff" : "#94a3b8",
                  fontFamily: "Georgia, serif",
                }}>
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: info.color }} />
                {ne ? info.nameNe : info.nameEn} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG map */}
      <div className="flex justify-center px-4 py-4 relative">
        <svg width={W} height={H} style={{ overflow: "visible" }}>
          {/* Arc guidelines */}
          {Array.from({ length: 9 }, (_, i) => {
            const r = 100 + i * 36;
            const a1 = Math.PI * 0.08, a2 = Math.PI * 0.92;
            return (
              <path key={i}
                d={`M ${cx + r * Math.cos(Math.PI - a1)} ${cy - r * Math.sin(a1)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(Math.PI - a2)} ${cy - r * Math.sin(a2)}`}
                fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
            );
          })}

          {/* Majority line */}
          <line x1={cx} y1={cy - 70} x2={cx} y2={cy - 390}
            stroke="#facc15" strokeWidth={1} strokeDasharray="5,7" opacity={0.2} />

          {/* Speaker podium */}
          <rect x={cx - 52} y={cy - 14} width={104} height={20} rx={5}
            fill="#162032" stroke="#2d4a66" strokeWidth={1.5} />
          <text x={cx} y={cy - 0.5} textAnchor="middle" dominantBaseline="middle"
            fill="#4a6a88" fontSize={9} fontFamily="Georgia, serif" letterSpacing={1.5}>
            SPEAKER
          </text>

          {/* Seats */}
          {seats.map((seat, idx) => {
            const pos = positions[idx];
            if (!pos) return null;
            const isHov = hoveredSeat === seat.id;
            const isDimmed = filterParty !== null && seat.party !== filterParty;
            return (
              <g key={seat.id}
                onMouseEnter={() => setHoveredSeat(seat.id)}
                onMouseLeave={() => setHoveredSeat(null)}
                onClick={() => {
                  const found = data.provinces
                    .flatMap((p) => p.districts.flatMap((d) => d.constituencies))
                    .find((c) => c.id === seat.id);
                  if (found) onSeatClick?.(found);
                }}
                style={{ cursor: "pointer" }}>
                {isHov && <circle cx={pos.x} cy={pos.y} r={16} fill={seat.color} opacity={0.2} />}
                <circle cx={pos.x} cy={pos.y} r={isHov ? 9.5 : 7.5}
                  fill={isDimmed ? "#1e3048" : seat.color}
                  stroke={isDimmed ? "#263c52" : isHov ? "#ffffff" : "rgba(255,255,255,0.18)"}
                  strokeWidth={isHov ? 2 : 0.8}
                  opacity={isDimmed ? 0.2 : 1}
                  style={{ transition: "all 0.12s ease" }} />
                {seat.status === "counting" && !isDimmed && (
                  <circle cx={pos.x + 5.5} cy={pos.y - 5.5} r={2.5}
                    fill="#fb923c" stroke="#0d1b2a" strokeWidth={1} />
                )}
                {isHov && (
                  <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                    fill="#fff" fontSize={6.5} fontWeight="bold" fontFamily="Georgia, serif">
                    {seat.number}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hovered && (() => {
          const info = PARTY_INFO[hovered.party as PartyCode];
          return (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none z-10"
              style={{
                background: "#0d1b2a", border: "1px solid #2d4a66", borderRadius: 10,
                padding: "10px 20px", boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                display: "flex", alignItems: "center", gap: 12, whiteSpace: "nowrap",
              }}>
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: hovered.color }} />
              <div>
                <div className="text-sm font-bold text-slate-100" style={{ fontFamily: "Georgia, serif" }}>
                  {hovered.name}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {info ? (ne ? info.nameNe : info.nameEn) : hovered.party}
                  {" · "}
                  {hovered.status === "declared" ? "✓ Declared" : hovered.status === "leading" ? "↑ Leading" : "⏳ Counting"}
                  {" · "}{hovered.margin}{" · "}{hovered.province}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Footer */}
      <div className="px-8 pb-5 flex flex-wrap gap-5 text-xs text-slate-500 border-t border-slate-700/40 pt-4">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />{ne ? "घोषित" : "Declared"}
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />{ne ? "गणना हुँदै" : "Counting"}
        </span>
        <span className="ml-auto">
          {ne ? "सिटमा होभर गर्नुहोस् · दललाई फिल्टर गर्न क्लिक गर्नुहोस्" : "Hover a seat for details · Click party to filter"}
        </span>
      </div>
    </div>
  );
}