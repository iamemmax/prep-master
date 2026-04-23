"use client";
import { useMemo } from "react";

interface HeatDay {
  date: string;
  minutes: number;
}

function generateMockSeries(days = 91): HeatDay[] {
  const out: HeatDay[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    let minutes = 0;
    const r = Math.random();
    if (r > 0.15) {
      const base = isWeekend ? 30 : 45;
      minutes = Math.floor(Math.random() * base + base * 0.3);
      if (r > 0.88) minutes += 60;
    }
    if (i % 14 === 3) minutes = 0;
    out.push({ date: d.toISOString().slice(0, 10), minutes });
  }
  return out;
}

// Muted slate/emerald scale. Dark = more activity.
function heatColor(m: number) {
  if (m <= 0)  return "#F1F5F9"; // slate-100
  if (m < 20)  return "#D1FAE5"; // emerald-100
  if (m < 45)  return "#6EE7B7"; // emerald-300
  if (m < 75)  return "#10B981"; // emerald-500
  return            "#047857"; // emerald-700
}

const DOW_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function StudyHeatmap({ days }: { days?: HeatDay[] } = {}) {
  const data = useMemo(() => days ?? generateMockSeries(91), [days]);

  const weeks = useMemo(() => {
    const cols: HeatDay[][] = [];
    let current: HeatDay[] = [];
    data.forEach((d, i) => {
      const dow = (new Date(d.date).getDay() + 6) % 7;
      if (i === 0 && dow !== 0) {
        for (let j = 0; j < dow; j++) current.push({ date: "", minutes: -1 });
      }
      current.push(d);
      if (current.length === 7) { cols.push(current); current = []; }
    });
    if (current.length > 0) {
      while (current.length < 7) current.push({ date: "", minutes: -1 });
      cols.push(current);
    }
    return cols;
  }, [data]);

  const totalMin    = data.reduce((a, b) => a + b.minutes, 0);
  const activeDays  = data.filter(d => d.minutes > 0).length;
  const longestStreak = useMemo(() => {
    let best = 0, cur = 0;
    for (const d of data) {
      if (d.minutes > 0) { cur++; best = Math.max(best, cur); } else cur = 0;
    }
    return best;
  }, [data]);
  const avgPerActive = activeDays > 0 ? Math.round(totalMin / activeDays) : 0;

  const monthLabels = weeks.map((w, i) => {
    const firstReal = w.find(d => d.date);
    if (!firstReal) return "";
    const d = new Date(firstReal.date);
    if (d.getDate() <= 7 || i === 0) return MONTHS[d.getMonth()];
    return "";
  });

  const CELL = 11;
  const GAP  = 3;

  return (
    <section className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800">
      <header className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">Study activity</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Last 90 days of practice minutes</p>
        </div>
      </header>

      <div className="px-5 py-4">
        {/* Data row */}
        <dl className="grid grid-cols-4 gap-6 mb-5">
          <Stat label="Total"         value={`${Math.floor(totalMin / 60)}h ${totalMin % 60}m`} />
          <Stat label="Active days"   value={`${activeDays}`} sub={`of ${data.length}`} />
          <Stat label="Longest streak" value={`${longestStreak}d`} />
          <Stat label="Avg / active"  value={`${avgPerActive}m`} />
        </dl>

        <div className="overflow-x-auto pb-1">
          <div className="inline-block">
            {/* Month labels */}
            <div className="flex ml-7 mb-1.5" style={{ gap: GAP }}>
              {monthLabels.map((m, i) => (
                <div
                  key={i}
                  className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium"
                  style={{ width: CELL }}
                >
                  {m}
                </div>
              ))}
            </div>

            <div className="flex">
              {/* DOW column */}
              <div className="flex flex-col mr-1.5" style={{ gap: GAP }}>
                {DOW_LABELS.map((d, i) => (
                  <div
                    key={i}
                    className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium"
                    style={{ height: CELL, lineHeight: `${CELL}px` }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="flex" style={{ gap: GAP }}>
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
                    {week.map((day, di) => (
                      <div
                        key={`${wi}-${di}`}
                        className="rounded-[2px]"
                        title={day.date ? `${day.date} · ${day.minutes} min` : ""}
                        style={{
                          width:  CELL,
                          height: CELL,
                          background: day.minutes < 0 ? "transparent" : heatColor(day.minutes),
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1.5 mt-4 ml-7 text-[10px] text-slate-500 dark:text-zinc-400">
              <span>0m</span>
              {[0, 15, 30, 60, 90].map(m => (
                <div
                  key={m}
                  className="rounded-[2px]"
                  style={{ width: CELL, height: CELL, background: heatColor(m) }}
                />
              ))}
              <span>90m+</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-medium">{label}</dt>
      <dd className="mt-1 text-base font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
        {value}
        {sub && <span className="text-xs font-normal text-slate-400 dark:text-zinc-500 ml-1">{sub}</span>}
      </dd>
    </div>
  );
}
