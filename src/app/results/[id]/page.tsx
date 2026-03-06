// app/results/[id]/page.tsx — Individual constituency SEO page

import type { Metadata } from "next";
import { generateMockData } from "@/lib/mock-data";
import { fetchElectionResults, getStatusBadge, getPartyColorClass } from "@/lib/ecn-parser";
import { PARTY_INFO } from "@/lib/mock-data";
import Link from "next/link";

// Allow dynamic paths (ECN IDs differ from mock IDs)
export const dynamicParams = true;

interface Props {
  params: Promise<{ id: string }>;
}

function getAllConstituenciesFromData(data: Awaited<ReturnType<typeof fetchElectionResults>>) {
  return data.provinces.flatMap((p) =>
    p.districts.flatMap((d) =>
      d.constituencies.map((c) => ({
        ...c,
        provinceId: p.id,
        provinceNameEn: p.nameEn,
        provinceNameNe: p.nameNe,
        districtNameEn: d.nameEn,
        districtNameNe: d.nameNe,
      }))
    )
  );
}

export async function generateStaticParams() {
  // Pre-build pages for all mock constituency IDs so the site works offline
  const data = generateMockData();
  return data.provinces.flatMap((p) =>
    p.districts.flatMap((d) =>
      d.constituencies.map((c) => ({ id: c.id }))
    )
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const liveData = await fetchElectionResults().catch(() => generateMockData());
  const constituencies = getAllConstituenciesFromData(liveData);
  const c = constituencies.find((x) => x.id === id);

  if (!c) return { title: "Constituency Not Found" };

  const leadingParty = PARTY_INFO[c.leadingParty];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nepal-election-live.vercel.app";

  return {
    title: `${c.nameEn} Election Result 2082 LIVE – ${leadingParty?.nameEn} Leading`,
    description: `Live election result for ${c.nameEn} constituency in Nepal 2082. ${leadingParty?.nameEn} is leading with ${c.leadingMargin.toLocaleString()} vote margin. ${c.totalVotesCounted.toLocaleString()} votes counted, ${c.turnoutPercentage}% turnout.`,
    alternates: { canonical: `${siteUrl}/results/${id}` },
    openGraph: {
      title: `${c.nameEn} 2082 Result – ${leadingParty?.nameEn} Leading by ${c.leadingMargin.toLocaleString()} votes`,
      description: `${c.totalVotesCounted.toLocaleString()} votes counted | ${c.turnoutPercentage}% turnout | ${c.status}`,
    },
  };
}

export default async function ConstituencyPage({ params }: Props) {
  const { id } = await params;
  const liveData = await fetchElectionResults().catch(() => generateMockData());
  const constituencies = getAllConstituenciesFromData(liveData);
  const c = constituencies.find((x) => x.id === id);

  if (!c) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Constituency not found</h1>
          <Link href="/" className="text-blue-500 hover:underline">← Back to all results</Link>
        </div>
      </div>
    );
  }

  const badge = getStatusBadge(c.status);
  const leadingParty = PARTY_INFO[c.leadingParty];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nepal-election-live.vercel.app";

  // Structured data for this constituency
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: `${c.nameEn} Constituency Election Result 2082 – ${leadingParty?.nameEn} Leading`,
    description: `Live vote count for ${c.nameEn}: ${c.totalVotesCounted.toLocaleString()} votes counted`,
    datePublished: new Date().toISOString(),
    dateModified: c.lastUpdated,
    publisher: { "@type": "Organization", name: "NepalElectionLive", url: siteUrl },
    mainEntityOfPage: `${siteUrl}/results/${id}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <header className="bg-slate-900 text-white px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <Link href="/" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-3">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              All Results
            </Link>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-black">{c.nameEn}</h1>
                <p className="text-slate-400 text-sm">{c.nameNe} · {(c as { districtNameEn: string }).districtNameEn} · {(c as { provinceNameEn: string }).provinceNameEn}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>{badge.label}</span>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">

          {/* Key stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Votes Counted", value: c.totalVotesCounted.toLocaleString("en-IN") },
              { label: "Turnout", value: `${c.turnoutPercentage}%` },
              { label: "Leading Margin", value: `+${c.leadingMargin.toLocaleString("en-IN")}` },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
                <p className="text-lg font-black text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Candidates */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <h2 className="px-5 py-3 text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-slate-700">
              Candidate Results
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {c.candidates.sort((a, b) => b.votes - a.votes).map((cand) => {
                const party = PARTY_INFO[cand.party];
                return (
                  <div key={cand.id} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {cand.isWinner && <span className="text-yellow-500 text-sm">🏆</span>}
                        {cand.isLeading && !cand.isWinner && <span className="text-blue-500 text-sm">▲</span>}
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{cand.nameEn}</p>
                          <p className="text-xs text-slate-500">{cand.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 dark:text-white">{cand.votes.toLocaleString("en-IN")}</p>
                        <p className="text-xs text-slate-500">{cand.percentage}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                        <div
                          style={{ width: `${cand.percentage}%`, background: party?.color ?? "#6b7280" }}
                          className="h-full rounded-full transition-all duration-700"
                        />
                      </div>
                      <span
                        className="text-xs font-bold text-white px-2 py-0.5 rounded"
                        style={{ background: party?.color ?? "#6b7280" }}
                      >
                        {party?.nameEn.split(" ")[0]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Back link */}
          <Link
            href="/"
            className="block text-center py-3 text-blue-500 hover:text-blue-400 font-medium text-sm"
          >
            ← View all 165 constituencies
          </Link>
        </main>
      </div>
    </>
  );
}
