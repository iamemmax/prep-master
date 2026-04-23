"use client";
import { Medal } from "lucide-react";

const MOCK = {
  label: "Silver Scholar",
  detail: "Answer 1,500 questions correctly",
  current: 1284,
  target: 1500,
  nextLabel: "Gold Scholar",
  nextTarget: 3000,
};

export default function MilestoneCard({
  label = MOCK.label,
  detail = MOCK.detail,
  current = MOCK.current,
  target = MOCK.target,
  nextLabel = MOCK.nextLabel,
  nextTarget = MOCK.nextTarget,
}: Partial<typeof MOCK> = {}) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  const remaining = Math.max(0, target - current);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#E2E8F0] dark:border-zinc-800 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
          <Medal size={16} className="text-amber-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#0F172B] dark:text-zinc-100 leading-tight">Next milestone</h3>
          <p className="text-[10px] text-[#99A1B2]">{detail}</p>
        </div>
      </div>

      <div className="flex items-baseline justify-between mb-1.5">
        <p className="text-xs font-semibold text-[#0F172B] dark:text-zinc-100">{label}</p>
        <p className="text-[11px] text-[#45556C] tabular-nums">
          <span className="font-bold text-[#0F172B]">{current.toLocaleString()}</span> / {target.toLocaleString()}
        </p>
      </div>

      <div className="h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg, #F7C948, #F59E0B)" }}
        />
      </div>

      <p className="text-[10px] text-[#894B00] font-medium">
        <span className="font-bold">{remaining.toLocaleString()}</span> questions until unlock
      </p>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-[#99A1B2]">
        <span>Then up next</span>
        <span className="font-semibold text-[#45556C] dark:text-zinc-300">{nextLabel} · {nextTarget.toLocaleString()}</span>
      </div>
    </div>
  );
}
