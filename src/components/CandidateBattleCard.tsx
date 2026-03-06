"use client";

// CandidateBattleCard.tsx — Head-to-head candidate battle view with vote gap

import { useContext } from "react";
import { LanguageContext } from "@/app/providers";
import { PARTY_INFO } from "@/lib/mock-data";
import type { Constituency } from "@/lib/types";
import { StatusPill, VoteGap } from "./LiveIndicators";
import WhatsAppShareButton, { buildConstituencyShareText } from "./WhatsAppShareButton";

interface Props {
  constituency: Constituency;
  compact?: boolean;
}

export default function CandidateBattleCard({ constituency, compact = false }: Props) {
  const { language } = useContext(LanguageContext);
  const ne = language === "ne";

  const [leader, challenger, third] = constituency.candidates;
  const leaderInfo = PARTY_INFO[leader?.party];
  const challengerInfo = PARTY_INFO[challenger?.party];

  const totalVotes = constituency.totalVotesCounted;
  const leaderPct = totalVotes > 0 ? (leader?.votes / totalVotes) * 100 : 0;
  const challengerPct = totalVotes > 0 ? (challenger?.votes / totalVotes) * 100 : 0;

  const gap = (leader?.votes ?? 0) - (challenger?.votes ?? 0);
  const isDeclared = constituency.status === "declared";
  const isCounting = constituency.status === "counting";

  const shareText = buildConstituencyShareText({
    constituencyName: ne ? constituency.nameNe : constituency.nameEn,
    leaderName: ne ? (leader?.name ?? "") : (leader?.nameEn ?? ""),
    leaderParty: ne ? (leaderInfo?.shortNe ?? "") : (leaderInfo?.nameEn ?? ""),
    leaderVotes: leader?.votes ?? 0,
    gap,
    status: constituency.status,
    ne,
  });

  const constName = ne ? constituency.nameNe : constituency.nameEn;

  if (compact) {
    // Compact version for inside district accordion
    return (
      <div className={`rounded-lg border overflow-hidden
        ${isDeclared
          ? "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20"
          : isCounting
          ? "border-yellow-500/20 bg-white dark:bg-slate-800/60"
          : "border-slate-200 dark:border-slate-700/40 bg-white/50 dark:bg-slate-800/40"
        }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-700/40">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">#{constituency.no}</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{constName}</span>
          </div>
          <StatusPill status={constituency.status} ne={ne} />
        </div>

        {/* Leader row */}
        {leader && (
          <div className="px-3 py-2">
            {/* Leader: name + party label + votes */}
            <div className="flex items-start gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 text-xs font-black shrink-0">★</span>
                  <span className="text-xs font-bold text-slate-100 truncate">
                    {ne ? leader.name : leader.nameEn}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5 pl-3">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${leaderInfo?.bgColor ?? "bg-gray-500"}`} />
                  <span className={`text-[10px] font-bold truncate ${leaderInfo?.textColor ?? "text-gray-400"}`}>
                    {ne ? (leaderInfo?.shortNe ?? leader.party) : (leaderInfo?.shortEn ?? leader.party)}
                  </span>
                  {totalVotes > 0 && (
                    <span className="text-[10px] text-slate-500 tabular-nums ml-1">
                      {leaderPct.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <span className={`text-xs font-black tabular-nums shrink-0 ${leaderInfo?.textColor ?? "text-gray-400"}`}>
                {leader.votes > 0 ? leader.votes.toLocaleString("en-IN") : "--"}
              </span>
            </div>

            {/* Vote bar */}
            {totalVotes > 0 && (
              <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden mb-1.5">
                <div
                  className={`h-full rounded-full ${leaderInfo?.bgColor ?? "bg-blue-500"} transition-all duration-700`}
                  style={{ width: `${leaderPct}%` }}
                />
                {challenger && (
                  <div
                    className={`h-full ${challengerInfo?.bgColor ?? "bg-gray-500"} transition-all duration-700`}
                    style={{ width: `${challengerPct}%` }}
                  />
                )}
                <div className="flex-1 bg-slate-700/40" />
              </div>
            )}

            {/* Challenger row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] shrink-0">2.</span>
                {challenger && (
                  <>
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${challengerInfo?.bgColor ?? "bg-gray-500"}`} />
                    <span className={`text-[10px] font-bold shrink-0 ${challengerInfo?.textColor ?? "text-gray-500"}`}>
                      {ne ? (challengerInfo?.shortNe ?? "") : (challengerInfo?.shortEn ?? "")}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {ne ? challenger.name : challenger.nameEn}
                      {" "}<span className="text-slate-400 dark:text-slate-500 tabular-nums">
                        {challenger.votes > 0 ? challenger.votes.toLocaleString("en-IN") : "--"}
                      </span>
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {gap > 0 && totalVotes > 0 && <VoteGap gap={gap} />}
                <WhatsAppShareButton text={shareText} compact />
              </div>
            </div>
          </div>
        )}

        {totalVotes === 0 && (
          <div className="px-3 py-2 text-center text-[10px] text-slate-400 dark:text-slate-500">
            {ne ? "मतगणना सुरु भएको छैन" : "Counting not started"}
          </div>
        )}
      </div>
    );
  }

  // Full version (used for featured/hot seat detail)
  return (
    <div className={`rounded-xl border-2 overflow-hidden shadow-lg
      ${isDeclared ? "border-emerald-500/40" : "border-slate-200 dark:border-slate-600/40"}
      bg-white dark:bg-slate-800`}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-3
        bg-slate-50 dark:bg-slate-700/40 border-b border-slate-200 dark:border-slate-700/40">
        <div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
            {ne ? "निर्वाचन क्षेत्र" : "Constituency"} #{constituency.no}
          </p>
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">{constName}</h3>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={constituency.status} ne={ne} size="md" />
          <WhatsAppShareButton text={shareText} label={ne ? "शेयर" : "Share"} />
        </div>
      </div>

      {/* Battle zone */}
      <div className="p-4">
        {/* Leader */}
        {leader && (
          <div className={`flex items-center gap-3 p-3 rounded-xl mb-2
            ${isDeclared ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20" : "bg-slate-50 dark:bg-slate-700/30"}`}>
            {/* Avatar circle */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center
              text-white font-black text-sm shrink-0
              ${leaderInfo?.bgColor ?? "bg-blue-600"}`}>
              {(ne ? leader.name : leader.nameEn).charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-xs">★</span>
                <p className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                  {ne ? leader.name : leader.nameEn}
                </p>
                {isDeclared && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10
                    border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
                    {ne ? "निर्वाचित" : "ELECTED"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`w-2 h-2 rounded-full ${leaderInfo?.bgColor ?? "bg-gray-400"}`} />
                <span className={`text-xs font-bold ${leaderInfo?.textColor ?? "text-gray-400"}`}>
                  {ne ? leaderInfo?.shortNe : leaderInfo?.nameEn}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-xl font-black tabular-nums ${leaderInfo?.textColor ?? "text-white"}`}>
                {leader.votes > 0 ? leader.votes.toLocaleString("en-IN") : "--"}
              </p>
              {totalVotes > 0 && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 tabular-nums">{leaderPct.toFixed(1)}%</p>
              )}
            </div>
          </div>
        )}

        {/* VS divider with gap */}
        {challenger && totalVotes > 0 && (
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/60" />
            <VoteGap gap={gap} ne={ne} />
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/60" />
          </div>
        )}

        {/* Challenger */}
        {challenger && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/20">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center
              text-white font-bold text-xs shrink-0
              ${challengerInfo?.bgColor ?? "bg-gray-600"}`}>
              {(ne ? challenger.name : challenger.nameEn).charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                {ne ? challenger.name : challenger.nameEn}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${challengerInfo?.bgColor ?? "bg-gray-400"}`} />
                <span className={`text-[10px] font-bold ${challengerInfo?.textColor ?? "text-gray-400"}`}>
                  {ne ? challengerInfo?.shortNe : challengerInfo?.nameEn}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-black text-slate-500 dark:text-slate-400 tabular-nums">
                {challenger.votes > 0 ? challenger.votes.toLocaleString("en-IN") : "--"}
              </p>
              {totalVotes > 0 && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">{challengerPct.toFixed(1)}%</p>
              )}
            </div>
          </div>
        )}

        {/* Third candidate (collapsed) */}
        {third && totalVotes > 0 && (
          <div className="flex items-center gap-2 mt-2 px-2 text-[10px] text-slate-500">
            <span>3.</span>
            <div className={`w-1.5 h-1.5 rounded-full ${PARTY_INFO[third.party]?.bgColor ?? "bg-gray-500"}`} />
            <span className="truncate">{ne ? third.name : third.nameEn}</span>
            <span className="ml-auto tabular-nums font-bold">{third.votes.toLocaleString("en-IN")}</span>
          </div>
        )}

        {/* Vote progress bar */}
        {totalVotes > 0 && (
          <div className="mt-3 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700/50 flex">
            {constituency.candidates.slice(0, 4).map((cand) => {
              const info = PARTY_INFO[cand.party];
              const w = (cand.votes / totalVotes) * 100;
              return (
                <div
                  key={cand.id}
                  className={`h-full ${info?.bgColor ?? "bg-gray-500"} transition-all duration-700`}
                  style={{ width: `${w}%` }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
