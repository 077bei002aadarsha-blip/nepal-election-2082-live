"use client";

interface AdSlotProps {
  type: "leaderboard" | "rectangle" | "mobile";
  className?: string;
}

export function AdSlot({ type, className = "" }: AdSlotProps) {
  const dimensions = {
    leaderboard: { width: "728px", height: "90px", label: "728×90" },
    rectangle: { width: "300px", height: "250px", label: "300×250" },
    mobile: { width: "320px", height: "50px", label: "320×50" },
  };

  const d = dimensions[type];

  return (
    <div
      className={`ad-slot flex items-center justify-center text-slate-400 text-xs border-2 border-dashed border-slate-300 dark:border-slate-600 ${className}`}
      style={{ minWidth: d.width, minHeight: d.height, maxWidth: "100%" }}
      aria-label={`Advertisement ${d.label}`}
    >
      {/* Replace this div with Adsaro/Google AdSense code */}
      {/* Example Adsaro: <ins className="adsaro-ad" data-ad-slot="XXXXX" /> */}
      <div className="text-center">
        <p className="font-medium">Ad {d.label}</p>
        <p className="text-slate-500 text-[10px]">Adsaro / Google AdSense</p>
      </div>
    </div>
  );
}
