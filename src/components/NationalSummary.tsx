"use client";
import { useContext } from "react";
import { LanguageContext } from "@/app/providers";
import { PARTY_INFO } from "@/lib/mock-data";
import type { ElectionResults, PartyCode } from "@/lib/types";

interface Props { data: ElectionResults }

export default function NationalSummary({ data }: Props) {
  const { language } = useContext(LanguageContext);
  const ne = language === "ne";

  // build display totals from raw data so that 'other' parties are split by name
  type DisplayKey = string; // either a PartyCode or the actual party name for unknowns
  interface Totals { seats: number; votes: number; percentage: number }

  const totalsMap: Record<DisplayKey, Totals> = {};
  const leadingMap: Record<DisplayKey, number> = {};

  data.provinces.forEach((prov) =>
    prov.districts.forEach((dist) =>
      dist.constituencies.forEach((con) => {
        const seatAwarded = con.status === "declared";
        if (con.candidates[0]) {
          const first = con.candidates[0];
          let partyName: string;
          if (first.party === 'other') {
            // use raw party name from ECN if available, otherwise fallback to candidate name
            partyName = first.partyLong || (ne ? first.name : first.nameEn) || 'Others';
          } else {
            partyName = PARTY_INFO[first.party]?.nameEn ?? first.party;
          }

          if (!totalsMap[partyName]) totalsMap[partyName] = { seats: 0, votes: 0, percentage: 0 };
          totalsMap[partyName].votes += first.votes;
          if (seatAwarded) totalsMap[partyName].seats += 1;

          if (first.isLeading) {
            leadingMap[partyName] = (leadingMap[partyName] ?? 0) + 1;
          }
        }

        // also count votes for other candidates so percentages reflect full vote count
        con.candidates.slice(1).forEach((cand) => {
          const partyName =
            cand.party === "other"
              ? cand.partyLong || (ne ? cand.name : cand.nameEn) || 'Others'
              : PARTY_INFO[cand.party]?.nameEn ?? cand.party;
          if (!totalsMap[partyName]) totalsMap[partyName] = { seats: 0, votes: 0, percentage: 0 };
          totalsMap[partyName].votes += cand.votes;
        });
      })
    )
  );

  // compute percentages
  const totalVotes = data.totalVotesCounted || Object.values(totalsMap).reduce((s, t) => s + t.votes, 0);
  Object.values(totalsMap).forEach((t) => {
    if (totalVotes > 0) t.percentage = Math.round((t.votes / totalVotes) * 1000) / 10;
  });

  let sorted = Object.entries(totalsMap)
    .filter(([, v]) => v.seats > 0 || v.votes > 0)
    .sort(([, a], [, b]) => b.seats - a.seats || b.votes - a.votes);
  if (process.env.NODE_ENV !== 'production') {
    console.log('national sorted keys', sorted.map(([k])=>k));
    console.log('leading map', leadingMap);
  }


  const maxSeats = sorted[0]?.[1].seats ?? 1;
  const majority = Math.ceil(data.totalSeats / 2);

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-700
      bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
      {/* header */}
      <div className="px-5 py-3 bg-slate-50 dark:bg-slate-700/50 border-b
        border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h2 className="font-bold text-slate-800 dark:text-slate-100">
          {ne ? "राष्ट्रिय सारांश" : "National Summary"}
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {ne
              ? `बहुमत: ${majority} सिट`
              : `Majority: ${majority} seats`}
          </span>
          <span className="text-xs text-blue-500 dark:text-blue-400 font-semibold">
            {ne
              ? `अग्रणी: ${data.seatsLeading} सिट`
              : `Leading: ${data.seatsLeading} seats`}
          </span>
        </div>
      </div>

      {/* majority line bar */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex h-6 rounded-full overflow-hidden border border-slate-100 dark:border-slate-700 relative">
          {sorted.map(([pc, v]) => {
            const pInfo = PARTY_INFO[pc];
            const widthPct = (v.seats / data.totalSeats) * 100;
            if (widthPct < 0.3) return null;
            return (
              <div
                key={pc}
                title={`${pInfo?.nameEn ?? pc}: ${v.seats} seats`}
                style={{ width: `${widthPct}%`, backgroundColor: pInfo?.color ?? "#9ca3af" }}
                className="transition-all duration-700"
              />
            );
          })}
          {/* majority marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/70 dark:bg-black/50"
            style={{ left: `${(majority / data.totalSeats) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 px-0.5">
          <span>0</span>
          <span>{ne ? `बहुमत ${majority}` : `Majority ${majority}`}</span>
          <span>{data.totalSeats}</span>
        </div>
      </div>

      {/* party table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-wider
              text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700">
              <th className="px-5 py-2 text-left">{ne ? "पार्टी" : "Party"}</th>
              <th className="px-3 py-2 text-right">{ne ? "सिट" : "Seats"}</th>              <th className="px-3 py-2 text-right">{ne ? "अग्रणी" : "Leading"}</th>              <th className="px-3 py-2 text-right">{ne ? "मत" : "Votes"}</th>
              <th className="px-5 py-2 text-right">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {sorted.map(([pc, v]) => {
              const pInfo = PARTY_INFO[pc];
              return (
                <tr key={pc} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: pInfo?.color ?? "#9ca3af" }}
                      />
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
                        {ne ? pInfo?.nameNe ?? pc : pInfo?.nameEn ?? pc}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                    {v.seats}
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-blue-500 dark:text-blue-400 tabular-nums">
                    {leadingMap[pc] ?? 0}
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-600 dark:text-slate-400 tabular-nums">
                    {v.votes.toLocaleString()}
                  </td>
                  <td className="px-5 py-2.5 text-right text-slate-500 dark:text-slate-400 tabular-nums">
                    {v.percentage.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-2 border-t border-slate-100 dark:border-slate-700
        text-[11px] text-slate-400 dark:text-slate-500">
        {ne
          ? `स्रोत: निर्वाचन आयोग नेपाल • अन्तिम अपडेट: ${data.lastUpdated}`
          : `Source: Election Commission Nepal · Last updated: ${data.lastUpdated}`}
      </div>
    </section>
  );
}
