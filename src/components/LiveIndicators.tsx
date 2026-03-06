"use client";

// LiveIndicators.tsx — Status pill system: ● Counting | ✓ Declared | ★ Leading | – Awaiting

interface StatusPillProps {
  status: string;
  ne?: boolean;
  size?: "sm" | "md";
}

const CONFIG: Record<string, { icon: string; en: string; ne: string; cls: string; pulse?: boolean }> = {
  declared:    { icon: "✓", en: "Declared",  ne: "घोषित",       cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  counting:    { icon: "●", en: "Counting",  ne: "मतगणना",      cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", pulse: true },
  leading:     { icon: "●", en: "Leading",   ne: "अग्रणी",      cls: "bg-blue-500/20 text-blue-400 border-blue-500/30", pulse: true },
  not_started: { icon: "–", en: "Awaiting",  ne: "प्रतीक्षारत",  cls: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
  won:         { icon: "✓", en: "Elected",   ne: "निर्वाचित",   cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  trailing:    { icon: "↓", en: "Trailing",  ne: "पछि",         cls: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
  lost:        { icon: "✗", en: "Lost",      ne: "पराजित",      cls: "bg-red-500/20 text-red-400 border-red-500/30" },
};

export function StatusPill({ status, ne = false, size = "sm" }: StatusPillProps) {
  const cfg = CONFIG[status] ?? CONFIG.not_started;
  const sizeClass = size === "md"
    ? "text-xs px-2.5 py-1 gap-1.5"
    : "text-[10px] px-2 py-0.5 gap-1";

  return (
    <span className={`inline-flex items-center font-bold border rounded-full whitespace-nowrap
      ${sizeClass} ${cfg.cls}`}>
      <span className={cfg.pulse ? "animate-pulse" : ""}>{cfg.icon}</span>
      {ne ? cfg.ne : cfg.en}
    </span>
  );
}

// Live pulse dot (red, for "LIVE" badge)
export function LiveDot({ className = "" }: { className?: string }) {
  return (
    <span className={`relative flex h-2 w-2 ${className}`}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
    </span>
  );
}

// Counting animation dot
export function CountingDot({ className = "" }: { className?: string }) {
  return (
    <span className={`relative flex h-2 w-2 ${className}`}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
    </span>
  );
}

// VoteGap arrow — shows lead margin with coloured arrow
export function VoteGap({
  gap,
  ne = false,
}: {
  gap: number;
  ne?: boolean;
}) {
  if (gap <= 0) return null;
  const label = `+${gap.toLocaleString("en-IN")}`;
  return (
    <span className="inline-flex items-center gap-0.5 text-emerald-400 font-bold text-xs tabular-nums">
      <span>↑</span>
      {label}
      {ne && <span className="font-normal text-emerald-400/70 ml-0.5">मतको अग्रता</span>}
    </span>
  );
}

// Progress bar segment (per-party colour fill)
export function PartyBar({
  percentage,
  colorClass,
  label,
}: {
  percentage: number;
  colorClass: string;
  label?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      {label && (
        <span className="text-[9px] font-bold text-slate-400 truncate">{label}</span>
      )}
      <div className="h-2 rounded-full overflow-hidden bg-slate-700/40">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <span className="text-[9px] text-slate-400 tabular-nums">{percentage.toFixed(1)}%</span>
    </div>
  );
}
