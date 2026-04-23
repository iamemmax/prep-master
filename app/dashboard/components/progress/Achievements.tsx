"use client";
import { Check, Lock } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  detail: string;
  criterion: string;
  earned: boolean;
  earnedOn?: string;
  progress?: number;
}

const MILESTONES: Milestone[] = [
  { id: "streak-7",    title: "Seven-day consistency",   detail: "Study every day for one week",                       criterion: "7 consecutive days",                earned: true,  earnedOn: "2026-04-04" },
  { id: "score-80",    title: "Accuracy above 80%",      detail: "Five consecutive sessions scoring 80% or higher",    criterion: "5 sessions · ≥ 80%",                earned: true,  earnedOn: "2026-03-22" },
  { id: "speed",       title: "Efficient response time", detail: "Sustained median under 30 seconds per question",     criterion: "50 answers · median < 30s",         earned: true,  earnedOn: "2026-04-11" },
  { id: "streak-30",   title: "Thirty-day consistency",  detail: "Study at least once per day for a month",            criterion: "30 consecutive days",               earned: false, progress: 47 },
  { id: "topic-master", title: "Topic proficiency",      detail: "Reach 90%+ mastery in any one content area",         criterion: "Mastery ≥ 90% in a topic",          earned: false, progress: 72 },
  { id: "volume",      title: "Question volume",         detail: "Complete 100 questions in a single calendar day",    criterion: "100 questions in 24 h",             earned: false, progress: 34 },
  { id: "review",      title: "Review habit",            detail: "Complete 500 spaced-repetition reviews",             criterion: "500 reviews completed",             earned: false, progress: 68 },
  { id: "percentile",  title: "Cohort ranking",          detail: "Enter the top 10% of peers in your sitting",         criterion: "Percentile ≥ 90",                   earned: false, progress: 22 },
];

function formatDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Achievements() {
  const earned = MILESTONES.filter(m => m.earned).length;

  return (
    <section className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800">
      <header className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">Milestones</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            <span className="font-semibold text-slate-700 dark:text-zinc-300 tabular-nums">{earned}</span> of {MILESTONES.length} earned
          </p>
        </div>
      </header>

      <div className="divide-y divide-slate-100 dark:divide-zinc-800">
        {MILESTONES.map(m => (
          <div key={m.id} className="flex items-center gap-4 px-5 py-3.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                m.earned ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500"
              }`}
            >
              {m.earned ? <Check size={14} strokeWidth={2.6} /> : <Lock size={12} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className={`text-sm font-semibold ${m.earned ? "text-slate-900 dark:text-zinc-100" : "text-slate-600 dark:text-zinc-400"}`}>
                  {m.title}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono tabular-nums">{m.criterion}</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate">{m.detail}</p>

              {!m.earned && m.progress != null && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 max-w-xs h-1 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: `${m.progress}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400 tabular-nums">{m.progress}%</span>
                </div>
              )}
            </div>

            <div className="text-right shrink-0 hidden sm:block">
              {m.earned ? (
                <p className="text-[11px] text-slate-500 tabular-nums">{formatDate(m.earnedOn)}</p>
              ) : (
                <p className="text-[11px] text-slate-300">Locked</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
