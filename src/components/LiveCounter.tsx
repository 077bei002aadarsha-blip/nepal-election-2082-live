"use client";

import { useEffect, useRef, useState } from "react";

interface LiveCounterProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  className?: string;
  highlight?: boolean;
}

export function LiveCounter({ value, label, prefix = "", suffix = "", className = "", highlight = false }: LiveCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(value);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (value === prevValueRef.current) return;

    const start = prevValueRef.current;
    const end = value;
    const diff = end - start;
    const duration = 1200; // ms
    const startTime = performance.now();

    setIsAnimating(true);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(start + diff * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setIsAnimating(false);
        prevValueRef.current = end;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  const formatted = displayValue.toLocaleString("en-IN");

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div
        className={`
          text-2xl sm:text-4xl font-black tabular-nums tracking-tight
          transition-colors duration-300
          ${highlight ? "text-emerald-400" : "text-white"}
          ${isAnimating ? "scale-105" : "scale-100"}
          transition-transform duration-150
        `}
      >
        {prefix}
        <span className={isAnimating ? "num-flip inline-block" : ""}>{formatted}</span>
        {suffix}
      </div>
      <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">{label}</div>
    </div>
  );
}
