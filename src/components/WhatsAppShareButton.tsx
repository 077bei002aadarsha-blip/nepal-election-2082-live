"use client";

interface WhatsAppShareProps {
  text: string;
  label?: string;
  compact?: boolean;
}

export default function WhatsAppShareButton({ text, label, compact = false }: WhatsAppShareProps) {
  const encoded = encodeURIComponent(text);
  const url = `https://wa.me/?text=${encoded}`;

  if (compact) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[10px] font-bold
          text-[#25D366] hover:text-emerald-300 transition-colors"
        title="Share on WhatsApp"
      >
        <WhatsAppIcon size={11} />
        <span>Share</span>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
        bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30
        text-[#25D366] font-bold text-xs transition-all hover:scale-105 active:scale-95"
      title="Share on WhatsApp"
    >
      <WhatsAppIcon size={14} />
      {label ?? "WhatsApp"}
    </a>
  );
}

// ── WhatsApp SVG ─────────────────────────────────────────────────────────────
export function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

// ── Share text builders ───────────────────────────────────────────────────────
export function buildConstituencyShareText(p: {
  constituencyName: string;
  leaderName: string;
  leaderParty: string;
  leaderVotes: number;
  gap: number;
  status: string;
  ne?: boolean;
}): string {
  if (p.ne) {
    const st = p.status === "declared" ? "निर्वाचित" : `${p.gap.toLocaleString("en-IN")} मतको अग्रता`;
    return `🗳️ नेपाल चुनाव २०८२\n${p.constituencyName}: ${p.leaderName} (${p.leaderParty}) - ${p.leaderVotes.toLocaleString("en-IN")} मत | ${st}\nLIVE: nepal-election-live.vercel.app`;
  }
  const st = p.status === "declared" ? "ELECTED" : `leading +${p.gap.toLocaleString("en-IN")} votes`;
  return `🗳️ Nepal Election 2082\n${p.constituencyName}: ${p.leaderName} (${p.leaderParty}) - ${p.leaderVotes.toLocaleString("en-IN")} votes | ${st}\nLIVE: nepal-election-live.vercel.app`;
}

export function buildNationalShareText(p: {
  declared: number;
  totalVotes: number;
  topParty: string;
  ne?: boolean;
}): string {
  if (p.ne) {
    return `🇳🇵 नेपाल चुनाव २०८२ LIVE\n${p.declared} सिट घोषित | ${p.totalVotes.toLocaleString("en-IN")} मत गणना\n${p.topParty} अग्रणी\nLIVE: nepal-election-live.vercel.app`;
  }
  return `🇳🇵 Nepal Election 2082 LIVE\n${p.declared} seats declared | ${p.totalVotes.toLocaleString("en-IN")} votes counted\n${p.topParty} leading\nLIVE: nepal-election-live.vercel.app`;
}
