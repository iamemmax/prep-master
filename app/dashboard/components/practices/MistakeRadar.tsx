"use client";
import { ArrowRight } from "lucide-react";

interface WeakTopic {
  id: number;
  name: string;
  mastery: number;
  attempts: number;
  trend: "up" | "down" | "flat";
}

interface Pattern {
  kind: "rushing" | "trap_answer" | "overconfident";
  topic: string;
  detail: string;
}

const MOCK_WEAK: WeakTopic[] = [
  { id: 1, name: "Thermodynamics",        mastery: 32, attempts: 18, trend: "down" },
  { id: 2, name: "Stoichiometry",         mastery: 41, attempts: 22, trend: "flat" },
  { id: 3, name: "Kinetics & Equilibria", mastery: 58, attempts: 14, trend: "up"   },
];

const MOCK_PATTERNS: Pattern[] = [
  { kind: "rushing",     topic: "Thermodynamics", detail: "Median response 18s vs cohort 34s — accuracy drops 23 pts" },
  { kind: "trap_answer", topic: "Stoichiometry",  detail: "Selects mirror-of-correct option 4× more often than peers" },
];

function trendSymbol(t: WeakTopic["trend"]) {
  if (t === "up")   return { char: "↑", color: "text-emerald-600" };
  if (t === "down") return { char: "↓", color: "text-rose-600"    };
  return                   { char: "→", color: "text-slate-400"   };
}

function masteryHex(m: number) {
  if (m < 40) return "#DC2626";
  if (m < 70) return "#F59E0B";
  return            "#059669";
}

function patternLabel(k: Pattern["kind"]) {
  if (k === "rushing")     return "Rushing";
  if (k === "trap_answer") return "Mirror-option bias";
  return                          "Overconfidence";
}

export default function MistakeRadar({
  weak = MOCK_WEAK,
  patterns = MOCK_PATTERNS,
}: { weak?: WeakTopic[]; patterns?: Pattern[] } = {}) {
  const targetCount = weak.length * 5;

  return (
    <section className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 flex flex-col">
      <header className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">Weak-topic analysis</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Topics ranked by declining mastery score</p>
        </div>
      </header>

      <div className="divide-y divide-slate-100 dark:divide-zinc-800 flex-1">
        {weak.map(t => {
          const trend = trendSymbol(t.trend);
          return (
            <div key={t.id} className="flex items-center gap-4 px-5 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">{t.name}</p>
                  <span className={`text-[11px] font-bold tabular-nums ${trend.color}`} title={`Trend: ${t.trend}`}>
                    {trend.char}
                  </span>
                </div>
                <div className="h-1 w-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${t.mastery}%`, background: masteryHex(t.mastery) }} />
                </div>
              </div>
              <div className="text-right shrink-0 tabular-nums">
                <p className="text-sm font-semibold" style={{ color: masteryHex(t.mastery) }}>
                  {t.mastery}%
                </p>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500">{t.attempts} attempts</p>
              </div>
            </div>
          );
        })}
      </div>

      {patterns.length > 0 && (
        <div className="border-t border-slate-100 dark:border-zinc-800 px-5 py-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-medium mb-2">Observations</p>
          <ul className="space-y-1.5">
            {patterns.map((p, i) => (
              <li key={i} className="text-[11px] text-slate-600 dark:text-zinc-400 leading-snug">
                <span className="font-semibold text-slate-900 dark:text-zinc-100">{patternLabel(p.kind)}</span>
                <span className="text-slate-400 mx-1">·</span>
                <span className="font-medium text-slate-700">{p.topic}</span>
                <span className="block text-[11px] text-slate-500">{p.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <footer className="border-t border-slate-100 dark:border-zinc-800 px-5 py-3">
        <button
          className="w-full inline-flex items-center justify-center gap-2 h-9 rounded-md bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          Practice these {weak.length} topics · {targetCount} questions
          <ArrowRight size={12} />
        </button>
      </footer>
    </section>
  );
}
