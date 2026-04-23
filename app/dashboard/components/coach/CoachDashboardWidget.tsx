"use client";

import { Sparkles, Target, ArrowRight, Flame, RotateCw, AlertTriangle } from "lucide-react";
import { useDashboardInsight } from "../../util/ai/useAIFeedback";
import { DashboardInsightRequest } from "../../util/ai/types";

export default function CoachDashboardWidget({ request }: { request: DashboardInsightRequest | null }) {
  const { data, isLoading, error, refetch } = useDashboardInsight(request);

  return (
    <div className="relative rounded-2xl border border-[#F7C948]/40 dark:border-amber-500/30 bg-linear-to-br from-[#FFFBEB] via-white to-[#FFF7ED] dark:from-amber-500/10 dark:via-zinc-900 dark:to-orange-500/10 p-5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#F7C948] text-[#5A3300] shadow-sm">
            <Sparkles size={15} fill="currentColor" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 tracking-tight">AI Coach</p>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400">At a glance</p>
          </div>
        </div>
        <button
          onClick={refetch}
          disabled={isLoading || !request}
          title="Refresh"
          className="text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 p-1.5 rounded-md hover:bg-white/60 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40"
        >
          <RotateCw size={13} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {error ? (
        <div className="flex items-start gap-2.5 p-3 rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50/60 dark:bg-rose-500/10">
          <AlertTriangle size={14} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-800 dark:text-zinc-100">Coach unavailable</p>
            <p className="text-[11px] text-slate-600 dark:text-zinc-300 mt-0.5">Temporary — try again in a moment.</p>
          </div>
          <button
            onClick={refetch}
            className="shrink-0 text-[11px] font-semibold px-2.5 h-7 rounded-md border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-white/60 dark:hover:bg-rose-500/20 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : isLoading || !data ? (
        <LoadingState />
      ) : (
        <div className="space-y-3">
          {/* Feedback */}
          <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 leading-relaxed">
            {data.feedback}
          </p>

          {/* Focus area pill */}
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#F7C948] text-[#5A3300]">
            <Target size={11} />
            Focus: {data.focusArea}
          </div>

          {/* Next action */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-slate-200/60 dark:border-zinc-800">
            <ArrowRight size={14} className="text-[#E17100] shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 mb-0.5">
                Do this now
              </p>
              <p className="text-xs text-slate-700 dark:text-zinc-200 leading-relaxed">{data.nextAction}</p>
            </div>
          </div>

          {/* Motivation strip */}
          <div className="flex items-center gap-2 pt-1">
            <Flame size={12} className="text-[#E17100] shrink-0" fill="currentColor" />
            <p className="text-[11px] italic text-[#5A3300] dark:text-amber-200">{data.motivation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  const bar = "bg-slate-200/60 dark:bg-zinc-800 animate-pulse";
  return (
    <div className="space-y-3">
      <div className={`h-4 rounded-full w-full ${bar}`} />
      <div className={`h-4 rounded-full w-5/6 ${bar}`} />
      <div className={`h-6 rounded-md w-28 ${bar}`} />
      <div className={`h-16 rounded-lg w-full ${bar}`} />
    </div>
  );
}
