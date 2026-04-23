"use client";

interface PredictedScoreProps {
  examName?: string;
  predicted: number;
  rangeLow: number;
  rangeHigh: number;
  goal: number;
  coverage: number;
  series: { date: string; score: number }[];
}

const MOCK: PredictedScoreProps = {
  examName: "SAT",
  predicted: 78,
  rangeLow: 71,
  rangeHigh: 85,
  goal: 85,
  coverage: 0.54,
  series: [
    { date: "W1", score: 58 },
    { date: "W2", score: 62 },
    { date: "W3", score: 61 },
    { date: "W4", score: 67 },
    { date: "W5", score: 70 },
    { date: "W6", score: 72 },
    { date: "W7", score: 75 },
    { date: "W8", score: 78 },
  ],
};

function Sparkline({ data, goal }: { data: { score: number }[]; goal: number }) {
  const W = 260, H = 60, pad = 4;
  const scores = data.map(d => d.score);
  const min = Math.min(...scores, goal) - 5;
  const max = Math.max(...scores, goal) + 5;
  const scaleX = (i: number) => pad + (i / (data.length - 1)) * (W - pad * 2);
  const scaleY = (v: number) => H - pad - ((v - min) / (max - min)) * (H - pad * 2);

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(i).toFixed(1)} ${scaleY(d.score).toFixed(1)}`)
    .join(" ");

  return (
    <svg width={W} height={H} className="overflow-visible">
      <line
        x1={pad}
        x2={W - pad}
        y1={scaleY(goal)}
        y2={scaleY(goal)}
        stroke="#CAD5E2"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <path d={linePath} fill="none" className="stroke-slate-900 dark:stroke-zinc-100" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={scaleX(data.length - 1)}
        cy={scaleY(data[data.length - 1].score)}
        r={3}
        className="fill-slate-900 stroke-white dark:fill-zinc-100 dark:stroke-zinc-900"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function PredictedScore({
  examName = MOCK.examName,
  predicted = MOCK.predicted,
  rangeLow = MOCK.rangeLow,
  rangeHigh = MOCK.rangeHigh,
  goal = MOCK.goal,
  coverage = MOCK.coverage,
  series = MOCK.series,
}: Partial<PredictedScoreProps> = {}) {
  const gap = predicted - goal;
  const onTrack = gap >= 0;
  const coveragePct = Math.round(coverage * 100);

  return (
    <section className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 mb-6">
      <header className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">Predicted {examName} score</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Rolling estimate · updated continuously from recent sessions</p>
        </div>
        <button className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 underline underline-offset-2 decoration-slate-300">
          Methodology
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-x-8 gap-y-4 px-5 py-5 items-center">
        {/* Primary value */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-medium">Projection</p>
          <p className="text-4xl font-semibold text-slate-900 dark:text-zinc-100 tabular-nums leading-none mt-1">{predicted}<span className="text-2xl text-slate-400 font-normal">%</span></p>
          <p className="text-xs text-slate-500 mt-2">
            95% interval <span className="font-semibold text-slate-800 tabular-nums">{rangeLow}–{rangeHigh}%</span>
          </p>
        </div>

        {/* Sparkline */}
        <div className="flex flex-col items-start lg:items-center">
          <div className="flex items-baseline gap-3 mb-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-medium">8-week trajectory</p>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <span className="inline-block w-2 h-px bg-slate-400" /> goal line
            </p>
          </div>
          <Sparkline data={series} goal={goal} />
        </div>

        {/* Breakdown */}
        <div className="space-y-2.5">
          <Row
            label="Goal"
            value={`${goal}%`}
            delta={
              <span className={`tabular-nums font-semibold ${onTrack ? "text-emerald-600" : "text-rose-600"}`}>
                {gap >= 0 ? "+" : ""}{gap} pts
              </span>
            }
          />
          <Row
            label="Syllabus coverage"
            value={`${coveragePct}%`}
            delta={coveragePct < 60
              ? <span className="text-amber-600 text-[11px]">below recommended</span>
              : null
            }
          />
        </div>
      </div>
    </section>
  );
}

function Row({ label, value, delta }: { label: string; value: string; delta?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 min-w-50">
      <span className="text-[11px] text-slate-500 dark:text-zinc-400">{label}</span>
      <span className="flex items-baseline gap-2">
        <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">{value}</span>
        {delta}
      </span>
    </div>
  );
}
