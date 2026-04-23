"use client";
import { Users, TrendingUp } from "lucide-react";

const MOCK = {
  percentile: 72,
  cohortSize: 2840,
  cohortLabel: "May 2026 SAT takers",
  movement: 5,
};

export default function PeerPercentile({
  percentile = MOCK.percentile,
  cohortSize = MOCK.cohortSize,
  cohortLabel = MOCK.cohortLabel,
  movement = MOCK.movement,
}: Partial<typeof MOCK> = {}) {
  const markerX = `${percentile}%`;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#E2E8F0] dark:border-zinc-800 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
          <Users size={16} className="text-indigo-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#0F172B] dark:text-zinc-100 leading-tight">Peer percentile</h3>
          <p className="text-[10px] text-[#99A1B2]">Among {cohortSize.toLocaleString()} {cohortLabel}</p>
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <p className="text-3xl font-bold text-[#0F172B] dark:text-zinc-100 leading-none tabular-nums">{percentile}<span className="text-lg text-[#45556C]">th</span></p>
        <p className={`text-[11px] font-semibold flex items-center gap-0.5 ${movement >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
          <TrendingUp size={11} className={movement < 0 ? "rotate-180" : ""} />
          {movement >= 0 ? "+" : ""}{movement} this week
        </p>
      </div>

      <div className="relative h-3 rounded-full overflow-hidden mb-2"
        style={{ background: "linear-gradient(90deg, #EF4444 0%, #F7C948 50%, #10B97D 100%)" }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1 h-5 bg-white rounded shadow-md ring-1 ring-slate-300"
          style={{ left: markerX }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-[#99A1B2]">
        <span>0th</span>
        <span>50th</span>
        <span>100th</span>
      </div>

      <p className="text-[11px] text-[#45556C] mt-3 leading-snug">
        You&apos;re scoring higher than <span className="font-semibold text-[#0F172B] dark:text-zinc-100">{percentile}%</span> of peers preparing for the same exam.
      </p>
    </div>
  );
}
