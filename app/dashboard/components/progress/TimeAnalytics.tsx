"use client";

interface TimeBucket {
  label: string;
  count: number;
  accuracy: number;
}

const BUCKETS: TimeBucket[] = [
  { label: "< 15s",    count: 42,  accuracy: 48 },
  { label: "15–30s",   count: 128, accuracy: 71 },
  { label: "30–60s",   count: 196, accuracy: 84 },
  { label: "1–2 min",  count: 88,  accuracy: 72 },
  { label: "> 2 min",  count: 31,  accuracy: 52 },
];

const AVG_SECONDS        = 52;
const COHORT_SECONDS     = 68;

function accuracyHex(a: number) {
  if (a < 55) return "#DC2626";
  if (a < 75) return "#F59E0B";
  return            "#059669";
}

export default function TimeAnalytics() {
  const maxCount = Math.max(...BUCKETS.map(b => b.count));
  const totalAnswered = BUCKETS.reduce((a, b) => a + b.count, 0);
  const peak = BUCKETS.reduce((a, b) => (b.accuracy > a.accuracy ? b : a), BUCKETS[0]);

  return (
    <section className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 flex flex-col">
      <header className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">Response time vs accuracy</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{totalAnswered.toLocaleString()} responses across all sessions</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-medium">Median</p>
          <p className="text-base font-semibold text-slate-900 dark:text-zinc-100 leading-none tabular-nums">
            {AVG_SECONDS}s
            <span className="text-xs font-normal text-slate-400 ml-1">/ cohort {COHORT_SECONDS}s</span>
          </p>
        </div>
      </header>

      <div className="px-5 py-4 flex-1">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-medium">
              <th className="text-left pb-2 font-medium">Bucket</th>
              <th className="text-right pb-2 font-medium">Responses</th>
              <th className="text-right pb-2 font-medium w-[55%]">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {BUCKETS.map(b => {
              const widthPct = (b.count / maxCount) * 100;
              const acc = accuracyHex(b.accuracy);
              return (
                <tr key={b.label} className="border-t border-slate-100 dark:border-zinc-800">
                  <td className="py-2.5 text-xs font-medium text-slate-700 dark:text-zinc-300 tabular-nums">{b.label}</td>
                  <td className="py-2.5 text-xs text-slate-600 dark:text-zinc-400 text-right tabular-nums">{b.count}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="flex-1 h-1.5 rounded-sm bg-slate-100 dark:bg-zinc-800 overflow-hidden max-w-30">
                        <div className="h-full" style={{ width: `${widthPct}%`, background: acc }} />
                      </div>
                      <span className="text-xs font-semibold tabular-nums w-9 text-right" style={{ color: acc }}>
                        {b.accuracy}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className="px-5 py-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/60 rounded-b-xl">
        <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
          <span className="font-semibold text-slate-800 dark:text-zinc-200">Observation.</span>{" "}
          Accuracy peaks at <span className="font-semibold text-slate-800 dark:text-zinc-200 tabular-nums">{peak.accuracy}%</span> in the <span className="font-semibold text-slate-800 dark:text-zinc-200">{peak.label}</span> bucket.
          Answers under 15s drop to <span className="font-semibold text-slate-800 dark:text-zinc-200 tabular-nums">{BUCKETS[0].accuracy}%</span>, suggesting rushed responses.
        </p>
      </footer>
    </section>
  );
}
