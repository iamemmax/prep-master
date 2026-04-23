"use client";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Kpi {
  label: string;
  value: string;
  delta: number;       // signed percent change or raw delta
  deltaLabel: string;
  deltaPositive: boolean;
}

const KPIS: Kpi[] = [
  { label: "Accuracy",        value: "78%",   delta:  6, deltaLabel: "vs last week",    deltaPositive: true  },
  { label: "Questions",       value: "1,284", delta: 142, deltaLabel: "this week",      deltaPositive: true  },
  { label: "Avg time / Q",    value: "52s",   delta: -3, deltaLabel: "vs last week",    deltaPositive: true  },
  { label: "Current streak",  value: "14 d",  delta:  0, deltaLabel: "Longest 22 d",    deltaPositive: true  },
];

export default function ProgressKpis() {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 mb-6">
      {KPIS.map((k, i) => (
        <div
          key={k.label}
          className={`px-5 py-4 ${i > 0 ? "lg:border-l border-slate-100 dark:border-zinc-800" : ""} ${i === 2 ? "lg:border-l border-slate-100 dark:border-zinc-800" : ""} ${i >= 2 ? "border-t lg:border-t-0" : ""} ${i === 1 ? "border-l" : ""} border-slate-100 dark:border-zinc-800`}
        >
          <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-medium">{k.label}</p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-slate-900 dark:text-zinc-100 tabular-nums leading-none">{k.value}</p>
            {k.delta !== 0 && (
              <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium tabular-nums ${
                k.deltaPositive ? "text-emerald-600" : "text-rose-600"
              }`}>
                {k.deltaPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {k.delta > 0 ? "+" : ""}{k.delta}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">{k.deltaLabel}</p>
        </div>
      ))}
    </section>
  );
}
