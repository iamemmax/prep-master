"use client";
import { useMemo, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Point { day: number; score: number; }
type Range = "7d" | "30d" | "90d";

function gen(range: Range): Point[] {
  const n = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const base = range === "7d" ? 70 : range === "30d" ? 62 : 55;
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const drift = (i / n) * 20;
    const noise = (Math.random() - 0.4) * 12;
    pts.push({
      day: i,
      score: Math.round(Math.max(35, Math.min(96, base + drift + noise))),
    });
  }
  return pts;
}

export default function AccuracyTrend() {
  const [range, setRange] = useState<Range>("30d");
  const data = useMemo(() => gen(range), [range]);

  const W = 640, H = 180, padL = 32, padR = 12, padT = 12, padB = 24;
  const scores = data.map(d => d.score);
  const avg    = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const latest = scores[scores.length - 1];
  const first  = scores[0];
  const delta  = latest - first;

  const scaleX = (i: number) => padL + (i / (data.length - 1)) * (W - padL - padR);
  const scaleY = (v: number) => H - padB - ((v - 30) / 70) * (H - padT - padB);

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(i).toFixed(1)} ${scaleY(d.score).toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${scaleX(data.length - 1).toFixed(1)} ${H - padB} L ${padL} ${H - padB} Z`;

  const yTicks = [40, 60, 80, 100];

  return (
    <section className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800">
      <header className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">Accuracy trend</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Daily score percentage over selected range</p>
        </div>
        <div className="flex gap-0 border border-slate-200 dark:border-zinc-700 rounded-md overflow-hidden">
          {(["7d", "30d", "90d"] as Range[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`text-[11px] font-medium px-2.5 py-1 transition-colors ${
                range === r ? "bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900" : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </header>

      <div className="px-5 py-4">
        <dl className="grid grid-cols-3 gap-6 mb-4">
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-medium">Latest</dt>
            <dd className="text-xl font-semibold text-slate-900 dark:text-zinc-100 tabular-nums leading-none mt-1">{latest}%</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-medium">Average</dt>
            <dd className="text-xl font-semibold text-slate-900 dark:text-zinc-100 tabular-nums leading-none mt-1">{avg}%</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-medium">Change</dt>
            <dd className={`text-xl font-semibold tabular-nums leading-none mt-1 inline-flex items-center gap-1 ${delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {delta >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {delta >= 0 ? "+" : ""}{delta}
              <span className="text-xs font-normal text-slate-400 ml-0.5">pts</span>
            </dd>
          </div>
        </dl>

        <div className="w-full overflow-x-auto">
          <svg width={W} height={H} className="max-w-full">
            <defs>
              <linearGradient id="accuracyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#0F172B" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0F172B" stopOpacity="0"    />
              </linearGradient>
            </defs>

            {yTicks.map(t => (
              <g key={t}>
                <line x1={padL} x2={W - padR} y1={scaleY(t)} y2={scaleY(t)} stroke="#EEF0F4" strokeWidth="1" />
                <text x={padL - 8} y={scaleY(t) + 3} textAnchor="end" fontSize="10" fill="#94A3B8" fontFamily="ui-monospace, SFMono-Regular, monospace">{t}%</text>
              </g>
            ))}

            <path d={areaPath}  fill="url(#accuracyFill)" />
            <path d={linePath} fill="none" stroke="#0F172B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={scaleX(data.length - 1)} cy={scaleY(latest)} r="3.5" fill="#0F172B" stroke="#fff" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </section>
  );
}
