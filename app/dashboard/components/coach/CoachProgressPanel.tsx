"use client";

import { Sparkles, TrendingUp, TrendingDown, Minus, Lightbulb, ArrowRight, RotateCw } from "lucide-react";
import { useProgressInsight } from "../../util/ai/useAIFeedback";
import { ProgressInsightRequest, Trend } from "../../util/ai/types";
import ErrorCard from "./ErrorCard";

function trendDescriptor(t: Trend) {
  if (t === "increasing") return { Icon: TrendingUp,   color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", label: "Increasing" };
  if (t === "dropping")   return { Icon: TrendingDown, color: "text-rose-600 dark:text-rose-400",       bg: "bg-rose-50 dark:bg-rose-500/10",       label: "Dropping"   };
  return                        { Icon: Minus,        color: "text-slate-600 dark:text-zinc-300",     bg: "bg-slate-100 dark:bg-zinc-800",        label: "Flat"       };
}

export default function CoachProgressPanel({ request }: { request: ProgressInsightRequest | null }) {
  const { data, isLoading, error, refetch } = useProgressInsight(request);

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-zinc-800 bg-linear-to-br from-amber-50 via-white to-orange-50 dark:from-amber-500/10 dark:via-zinc-900 dark:to-orange-500/10">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#F7C948] text-[#5A3300] shrink-0 shadow-sm">
            <Sparkles size={17} fill="currentColor" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 tracking-tight">AI Progress Analysis</h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">Patterns across your last few weeks of practice</p>
          </div>
        </div>
        <button
          onClick={refetch}
          disabled={isLoading || !request}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 h-8 rounded-md border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
        >
          <RotateCw size={11} className={isLoading ? "animate-spin" : ""} />
          Regenerate
        </button>
      </div>

      {/* Body */}
      <div className="p-5">
        {error ? (
          <ErrorCard onRetry={refetch} retrying={isLoading} />
        ) : isLoading || !data ? (
          <LoadingState />
        ) : (
          <div className="space-y-5">
            {/* Trend pills */}
            {request && (
              <div className="flex gap-2 flex-wrap">
                <TrendPill label="Accuracy" trend={request.accuracyTrend} />
                <TrendPill label="Speed" trend={request.avgTimeTrend} />
                <ConsistencyPill level={request.consistency} />
              </div>
            )}

            {/* Summary */}
            <p className="text-sm text-slate-700 dark:text-zinc-200 leading-relaxed font-medium">
              {data.summary}
            </p>

            {/* Insights + recommendations grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Column title="Insights" icon={<Lightbulb size={12} className="text-[#F7C948]" />}>
                <ul className="space-y-2">
                  {data.insights.map((insight, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F7C948] shrink-0 mt-1.5" />
                      <span className="text-[13px] text-slate-700 dark:text-zinc-300 leading-relaxed">{insight}</span>
                    </li>
                  ))}
                </ul>
              </Column>

              <Column title="Recommendations" icon={<ArrowRight size={12} />}>
                <ul className="space-y-2">
                  {data.recommendations.map((rec, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    >
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#F7C948] text-[#5A3300] font-bold text-[10px] tabular-nums shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-[13px] text-slate-700 dark:text-zinc-200 leading-relaxed flex-1">{rec}</span>
                    </li>
                  ))}
                </ul>
              </Column>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Column({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 mb-2 inline-flex items-center gap-1.5">
        {icon}{title}
      </h4>
      {children}
    </div>
  );
}

function TrendPill({ label, trend }: { label: string; trend: Trend }) {
  const d = trendDescriptor(trend);
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md ${d.bg} ${d.color}`}>
      <d.Icon size={11} />
      {label}: {d.label}
    </span>
  );
}

function ConsistencyPill({ level }: { level: "high" | "medium" | "low" }) {
  const map = {
    high:   { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", label: "High" },
    medium: { color: "text-amber-700 dark:text-amber-300",     bg: "bg-amber-50 dark:bg-amber-500/10",     label: "Medium" },
    low:    { color: "text-rose-600 dark:text-rose-400",       bg: "bg-rose-50 dark:bg-rose-500/10",       label: "Low" },
  }[level];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md ${map.bg} ${map.color}`}>
      Consistency: {map.label}
    </span>
  );
}

function LoadingState() {
  const bar = "bg-slate-100 dark:bg-zinc-800 animate-pulse";
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
        <Sparkles size={13} className="text-[#F7C948] animate-pulse" />
        Analyzing your recent weeks…
      </div>
      <div className="flex gap-2">
        <div className={`h-7 rounded-md w-32 ${bar}`} />
        <div className={`h-7 rounded-md w-28 ${bar}`} />
        <div className={`h-7 rounded-md w-36 ${bar}`} />
      </div>
      <div className="space-y-2">
        <div className={`h-4 rounded-full w-full ${bar}`} />
        <div className={`h-4 rounded-full w-5/6 ${bar}`} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="space-y-2">
          <div className={`h-14 rounded-lg ${bar}`} />
          <div className={`h-14 rounded-lg ${bar}`} />
          <div className={`h-14 rounded-lg ${bar}`} />
        </div>
        <div className="space-y-2">
          <div className={`h-14 rounded-lg ${bar}`} />
          <div className={`h-14 rounded-lg ${bar}`} />
          <div className={`h-14 rounded-lg ${bar}`} />
        </div>
      </div>
    </div>
  );
}
