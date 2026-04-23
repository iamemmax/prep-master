"use client";

interface DayBar {
  label: string;
  minutes: number;
  questions: number;
}

const MOCK: DayBar[] = [
  { label: "Mon", minutes: 42, questions: 22 },
  { label: "Tue", minutes: 68, questions: 35 },
  { label: "Wed", minutes: 15, questions: 8  },
  { label: "Thu", minutes: 55, questions: 28 },
  { label: "Fri", minutes: 0,  questions: 0  },
  { label: "Sat", minutes: 92, questions: 47 },
  { label: "Sun", minutes: 38, questions: 18 },
];

export default function WeeklyActivity({ data = MOCK }: { data?: DayBar[] } = {}) {
  const max = Math.max(...data.map(d => d.minutes), 60);
  const totalMin = data.reduce((a, b) => a + b.minutes, 0);
  const totalQ   = data.reduce((a, b) => a + b.questions, 0);
  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#E2E8F0] dark:border-zinc-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-[#0F172B] dark:text-zinc-100 leading-tight">This week</h3>
          <p className="text-[10px] text-[#99A1B2]">
            <span className="font-bold text-[#0F172B]">{Math.round(totalMin / 60 * 10) / 10}h</span> studied ·
            <span className="font-bold text-[#0F172B]"> {totalQ}</span> questions
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-[#99A1B2] uppercase tracking-wide">Goal</p>
          <p className="text-xs font-bold text-[#0F172B] dark:text-zinc-100 leading-none">
            {Math.round((totalMin / (7 * 60)) * 100)}%
          </p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-28 mb-2">
        {data.map((d, i) => {
          const pct = d.minutes === 0 ? 0 : (d.minutes / max) * 100;
          const isToday = i === todayIdx;
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1 h-full">
              <div className="text-[9px] text-[#99A1B2] tabular-nums">
                {d.minutes > 0 ? `${d.minutes}m` : ""}
              </div>
              <div className="flex-1 w-full flex items-end">
                <div
                  className="w-full rounded-t-md transition-all hover:opacity-90"
                  title={`${d.label}: ${d.minutes} min · ${d.questions} qs`}
                  style={{
                    height: `${Math.max(2, pct)}%`,
                    background: d.minutes === 0
                      ? "#EEF0F4"
                      : isToday
                        ? "linear-gradient(180deg, #F7C948, #F59E0B)"
                        : "#FDE68A",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between gap-2">
        {data.map((d, i) => (
          <div
            key={d.label}
            className={`flex-1 text-center text-[10px] font-semibold ${i === todayIdx ? "text-[#894B00]" : "text-[#99A1B2]"}`}
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
