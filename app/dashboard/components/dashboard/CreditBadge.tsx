"use client";

import { Coins } from "lucide-react";

// TODO: replace with the real credit balance from the user/billing API once it
// exists. Keeping the source isolated here so swapping it later only touches
// this file.
function useCreditBalance(): { remaining: number; total: number } {
  return { remaining: 100, total: 250 };
}

export default function CreditBadge() {
  const { remaining, total } = useCreditBalance();
  const pct = total > 0 ? (remaining / total) * 100 : 0;

  // Icon color reflects how much is left so the user gets a quick health signal.
  const iconColor =
    pct > 50 ? "text-emerald-500"
    : pct > 20 ? "text-[#F7C948]"
    : "text-rose-500";

  return (
    <div
      title={`${remaining.toLocaleString()} of ${total.toLocaleString()} credits remaining`}
      aria-label={`${remaining} credits remaining`}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60"
    >
      <Coins className={`h-3.5 w-3.5 ${iconColor}`} strokeWidth={2.2} />
      <span className="text-xs font-semibold tabular-nums text-slate-700 dark:text-zinc-200">
        {remaining.toLocaleString()}
      </span>
      <span className="text-xs text-slate-500 dark:text-zinc-400">
        credits
      </span>
    </div>
  );
}