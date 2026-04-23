"use client";
import { ArrowRight } from "lucide-react";

interface TopicMemory {
  name: string;
  health: number;
}

interface MemoryRefreshProps {
  dueCount: number;
  overdueCount: number;
  memoryHealth: number;
  topics: TopicMemory[];
  estMinutes: number;
}

const MOCK: MemoryRefreshProps = {
  dueCount: 7,
  overdueCount: 3,
  memoryHealth: 78,
  estMinutes: 5,
  topics: [
    { name: "Kinematics",        health: 92 },
    { name: "Organic Reactions", health: 64 },
    { name: "Thermodynamics",    health: 38 },
    { name: "Cell Biology",      health: 81 },
    { name: "Probability",       health: 55 },
  ],
};

function healthHex(h: number) {
  if (h < 50) return "#DC2626";
  if (h < 75) return "#F59E0B";
  return            "#059669";
}

export default function MemoryRefresh({
  dueCount    = MOCK.dueCount,
  overdueCount = MOCK.overdueCount,
  memoryHealth = MOCK.memoryHealth,
  estMinutes   = MOCK.estMinutes,
  topics       = MOCK.topics,
}: Partial<MemoryRefreshProps> = {}) {
  const hex = healthHex(memoryHealth);
  const atRisk = topics.filter(t => t.health < 60).length;

  return (
    <section className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 flex flex-col">
      <header className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">Spaced review queue</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Items scheduled by forgetting-curve model</p>
        </div>
      </header>

      <div className="px-5 py-4">
        <dl className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-medium">Due</dt>
            <dd className="text-xl font-semibold text-slate-900 dark:text-zinc-100 tabular-nums mt-1 leading-none">{dueCount}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-medium">Overdue</dt>
            <dd className={`text-xl font-semibold tabular-nums mt-1 leading-none ${overdueCount > 0 ? "text-rose-600" : "text-slate-900"}`}>
              {overdueCount}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-medium">Health</dt>
            <dd className="text-xl font-semibold tabular-nums mt-1 leading-none" style={{ color: hex }}>
              {memoryHealth}%
            </dd>
          </div>
        </dl>

        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${memoryHealth}%`, background: hex }} />
        </div>
        {atRisk > 0 && (
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2">
            <span className="font-semibold text-rose-600 tabular-nums">{atRisk}</span> topics below 60% retention
          </p>
        )}
      </div>

      <div className="border-t border-slate-100 dark:border-zinc-800 px-5 py-3">
        <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-medium mb-2">Retention by topic</p>
        <ul className="space-y-1.5">
          {topics.slice(0, 5).map(t => {
            const tHex = healthHex(t.health);
            return (
              <li key={t.name} className="flex items-center gap-3 text-[11px]">
                <span className="text-slate-700 dark:text-zinc-300 truncate flex-1">{t.name}</span>
                <div className="w-24 h-1 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${t.health}%`, background: tHex }} />
                </div>
                <span className="w-9 text-right font-semibold tabular-nums" style={{ color: tHex }}>
                  {t.health}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <footer className="border-t border-slate-100 dark:border-zinc-800 px-5 py-3 mt-auto">
        <button className="w-full inline-flex items-center justify-center gap-2 h-9 rounded-md bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors">
          Start review · ~{estMinutes} min
          <ArrowRight size={12} />
        </button>
      </footer>
    </section>
  );
}
