import { useState, useMemo } from "react";

// Party colors & info
const PARTY_INFO = {
  CPN_UML: { color: "#ef4444", nameEn: "CPN-UML", nameNe: "एमाले" },
  NC:      { color: "#3b82f6", nameEn: "Nepali Congress", nameNe: "कांग्रेस" },
  CPN_MC:  { color: "#f97316", nameEn: "CPN (Maoist Centre)", nameNe: "माओवादी" },
  RSP:     { color: "#8b5cf6", nameEn: "RSP", nameNe: "रास्वपा" },
  RPP:     { color: "#10b981", nameEn: "RPP", nameNe: "राप्रपा" },
  LSP:     { color: "#f59e0b", nameEn: "Loktantrik Samajwadi", nameNe: "लोसपा" },
  IND:     { color: "#94a3b8", nameEn: "Independent", nameNe: "स्वतन्त्र" },
};

// Generate 165 mock seats distributed among parties
function generateSeats() {
  const distribution = [
    { party: "CPN_UML", count: 78 },
    { party: "NC",      count: 57 },
    { party: "CPN_MC",  count: 11 },
    { party: "RSP",     count: 7  },
    { party: "RPP",     count: 5  },
    { party: "LSP",     count: 4  },
    { party: "IND",     count: 3  },
  ];

  const seats = [];
  let seatNum = 1;
  for (const { party, count } of distribution) {
    for (let i = 0; i < count; i++) {
      seats.push({
        id: seatNum,
        number: seatNum,
        party,
        color: PARTY_INFO[party].color,
        status: Math.random() > 0.15 ? "declared" : "counting",
        name: `Constituency ${seatNum}`,
        margin: `+${(Math.random() * 5000 + 500).toFixed(0)}`,
      });
      seatNum++;
    }
  }
  // Shuffle for visual mix
  return seats.sort(() => Math.random() - 0.5).map((s, i) => ({ ...s, displayIndex: i }));
}

const ALL_SEATS = generateSeats();

// Compute semicircular arc positions (US Senate style)
function computeArcSeats(seats, cx, cy, rows = 8) {
  const positioned = [];
  const total = seats.length;

  // Distribute seats across arcs (inner rows fewer, outer more)
  const rowCounts = [];
  const minAngle = Math.PI * 0.08;
  const maxAngle = Math.PI * 0.92;

  // Approximate arc distribution
  const basePerRow = Math.floor(total / rows);
  let remaining = total;
  for (let r = 0; r < rows; r++) {
    const count = r === rows - 1 ? remaining : Math.round(basePerRow * (0.6 + r * 0.06));
    rowCounts.push(Math.min(count, remaining));
    remaining -= rowCounts[r];
    if (remaining <= 0) break;
  }

  const minRadius = 110;
  const radiusStep = 38;

  let seatIndex = 0;
  for (let r = 0; r < rowCounts.length; r++) {
    const count = rowCounts[r];
    const radius = minRadius + r * radiusStep;
    for (let s = 0; s < count && seatIndex < total; s++) {
      const angle = minAngle + (s / (count - 1 || 1)) * (maxAngle - minAngle);
      const x = cx + radius * Math.cos(Math.PI - angle);
      const y = cy - radius * Math.sin(angle);
      positioned.push({ ...seats[seatIndex], x, y, row: r });
      seatIndex++;
    }
  }
  return positioned;
}

export default function SeatMap() {
  const [hovered, setHovered] = useState(null);
  const [filter, setFilter] = useState("ALL");

  const W = 900, H = 520;
  const cx = W / 2, cy = H - 30;

  const positionedSeats = useMemo(() => computeArcSeats(ALL_SEATS, cx, cy, 9), []);

  const filtered = filter === "ALL"
    ? positionedSeats
    : positionedSeats.map(s => ({ ...s, dimmed: s.party !== filter }));

  const declared = ALL_SEATS.filter(s => s.status === "declared").length;

  const hoveredSeat = hovered ? positionedSeats.find(s => s.id === hovered) : null;

  return (
    <div style={{
      fontFamily: "'Georgia', 'Times New Roman', serif",
      background: "linear-gradient(160deg, #0f1923 0%, #1a2a3a 50%, #0f1923 100%)",
      minHeight: "100vh",
      padding: "32px 24px",
      color: "#e8dcc8",
    }}>

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{
          fontSize: 11, letterSpacing: 6, color: "#8a9bb0", textTransform: "uppercase",
          marginBottom: 8, fontFamily: "'Georgia', serif"
        }}>
          Federal Parliament of Nepal
        </div>
        <h1 style={{
          fontSize: 28, fontWeight: 700, margin: 0,
          color: "#f0e6d3",
          letterSpacing: 1,
        }}>
          House of Representatives — Seat Map
        </h1>
        <div style={{ fontSize: 13, color: "#6b7d8e", marginTop: 6, letterSpacing: 2 }}>
          165 FPTP CONSTITUENCIES · 2079 B.S.
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 32, marginBottom: 20,
        flexWrap: "wrap",
      }}>
        {[
          { label: "Total Seats", value: 165, color: "#e8dcc8" },
          { label: "Declared", value: declared, color: "#4ade80" },
          { label: "Counting", value: 165 - declared, color: "#fb923c" },
          { label: "Majority", value: 83, color: "#60a5fa" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 10, color: "#6b7d8e", letterSpacing: 2, textTransform: "uppercase", marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Legend / filter */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <button
          onClick={() => setFilter("ALL")}
          style={{
            padding: "4px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            border: filter === "ALL" ? "1.5px solid #e8dcc8" : "1.5px solid #3a4a5a",
            background: filter === "ALL" ? "#e8dcc8" : "transparent",
            color: filter === "ALL" ? "#0f1923" : "#8a9bb0",
            fontFamily: "Georgia, serif", letterSpacing: 1,
          }}>
          All Parties
        </button>
        {Object.entries(PARTY_INFO).map(([key, info]) => {
          const count = ALL_SEATS.filter(s => s.party === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilter(filter === key ? "ALL" : key)}
              style={{
                padding: "4px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                border: `1.5px solid ${filter === key ? info.color : "#3a4a5a"}`,
                background: filter === key ? info.color : "transparent",
                color: filter === key ? "#fff" : "#8a9bb0",
                fontFamily: "Georgia, serif", letterSpacing: 0.5,
                display: "flex", alignItems: "center", gap: 6,
              }}>
              <span style={{
                width: 10, height: 10, borderRadius: "50%",
                background: info.color, display: "inline-block", flexShrink: 0,
              }} />
              {info.nameEn} ({count})
            </button>
          );
        })}
      </div>

      {/* Main SVG Map */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg width={W} height={H} style={{ display: "block", overflow: "visible" }}>
          {/* Subtle arc guidelines */}
          {[110, 148, 186, 224, 262, 300, 338, 376, 414].map((r, i) => (
            <path
              key={i}
              d={`M ${cx - r * Math.cos(Math.PI * 0.08)} ${cy - r * Math.sin(Math.PI * 0.08)} 
                  A ${r} ${r} 0 0 1 ${cx + r * Math.cos(Math.PI * 0.08)} ${cy - r * Math.sin(Math.PI * 0.08)}`}
              fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={1}
            />
          ))}

          {/* Podium / dais at bottom center */}
          <rect x={cx - 70} y={cy - 10} width={140} height={22} rx={6}
            fill="#1e2d3d" stroke="#3a5068" strokeWidth={1.5} />
          <text x={cx} y={cy + 6} textAnchor="middle"
            fill="#6b8aaa" fontSize={10} fontFamily="Georgia, serif" letterSpacing={1}>
            SPEAKER
          </text>

          {/* Majority line */}
          <line x1={cx} y1={cy - 80} x2={cx} y2={cy - 430}
            stroke="#60a5fa" strokeWidth={1} strokeDasharray="4,6" opacity={0.3} />
          <text x={cx + 5} y={cy - 420} fill="#60a5fa" fontSize={9} opacity={0.5} fontFamily="Georgia, serif">
            Majority line
          </text>

          {/* Seats */}
          {filtered.map((seat) => {
            const isHovered = hovered === seat.id;
            const isDimmed = seat.dimmed;
            const r = isHovered ? 10 : 8;

            return (
              <g key={seat.id}
                onMouseEnter={() => setHovered(seat.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}>
                {/* Glow */}
                {isHovered && (
                  <circle cx={seat.x} cy={seat.y} r={15}
                    fill={seat.color} opacity={0.25} />
                )}

                {/* Seat circle */}
                <circle
                  cx={seat.x} cy={seat.y} r={r}
                  fill={isDimmed ? "#1e2a36" : seat.color}
                  stroke={isDimmed ? "#2a3a4a" : isHovered ? "#fff" : "rgba(255,255,255,0.2)"}
                  strokeWidth={isHovered ? 2 : 0.8}
                  opacity={isDimmed ? 0.25 : 1}
                  style={{ transition: "all 0.15s ease" }}
                />

                {/* Counting indicator */}
                {seat.status === "counting" && !isDimmed && (
                  <circle cx={seat.x + 6} cy={seat.y - 6} r={3}
                    fill="#fb923c" stroke="#0f1923" strokeWidth={1} />
                )}

                {/* Seat number (only at larger sizes or hovered) */}
                {isHovered && (
                  <text x={seat.x} y={seat.y + 0.5} textAnchor="middle" dominantBaseline="middle"
                    fill="#fff" fontSize={7} fontWeight="bold" fontFamily="Georgia, serif">
                    {seat.number}
                  </text>
                )}
              </g>
            );
          })}

          {/* Province arc labels */}
          {[
            { label: "Koshi", angle: 0.15 },
            { label: "Madhesh", angle: 0.30 },
            { label: "Bagmati", angle: 0.50 },
            { label: "Gandaki", angle: 0.65 },
            { label: "Lumbini", angle: 0.78 },
            { label: "Karnali", angle: 0.88 },
            { label: "Sudurpashchim", angle: 0.95 },
          ].map(({ label, angle }) => {
            const R = 460;
            const a = Math.PI * (0.08 + angle * 0.84);
            const x = cx + R * Math.cos(Math.PI - a);
            const y = cy - R * Math.sin(a);
            return (
              <text key={label} x={x} y={y} textAnchor="middle"
                fill="#3a5068" fontSize={9} fontFamily="Georgia, serif"
                letterSpacing={0.5}>
                {label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Tooltip card */}
      {hoveredSeat && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "#1a2a3a", border: "1px solid #3a5068",
          borderRadius: 12, padding: "12px 24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", gap: 16,
          zIndex: 100, pointerEvents: "none",
        }}>
          <div style={{
            width: 14, height: 14, borderRadius: "50%",
            background: hoveredSeat.color, flexShrink: 0,
          }} />
          <div>
            <div style={{ fontWeight: 700, color: "#e8dcc8", fontSize: 14 }}>
              {hoveredSeat.name}
            </div>
            <div style={{ fontSize: 12, color: "#8a9bb0", marginTop: 2 }}>
              {PARTY_INFO[hoveredSeat.party]?.nameEn} · {hoveredSeat.status === "declared" ? "✓ Declared" : "⏳ Counting"} · Margin {hoveredSeat.margin}
            </div>
          </div>
        </div>
      )}

      {/* Bottom legend */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 24, marginTop: 16,
        flexWrap: "wrap", fontSize: 11, color: "#6b7d8e",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fb923c" }} />
          Counting
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }} />
          Declared
        </div>
        <div>Hover a seat for details · Click party to filter</div>
      </div>
    </div>
  );
}