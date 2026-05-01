"use client";

import * as Avatar from "@radix-ui/react-avatar";
import { Flag } from "lucide-react";

type Confidence = "guess" | "likely" | "certain";

export default function SessionLeftRail({
  focus,
  firstName,
  lastName,
  email,
  preparingFor,
  examType,
  sessionMode,
  difficultyLevel,
  totalQuestions,
  isTimed,
  timerDisplay,
  answered,
  flagged,
  flaggedCount,
  confidence,
  current,
  /** Topic-name lookup for the flagged list. */
  topicAt,
  /** Plan name when subscribed, null when on free. */
  planName,
  onJump,
}: {
  focus: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  preparingFor: string | number | null | undefined;
  examType: string | number;
  sessionMode: string;
  difficultyLevel: string;
  totalQuestions: number;
  isTimed: boolean;
  timerDisplay: string;
  answered: Set<number>;
  flagged: Set<number>;
  flaggedCount: number;
  confidence: Record<number, Confidence>;
  current: number;
  topicAt: (i: number) => string;
  planName: string | null;
  onJump: (i: number) => void;
}) {
  if (focus) return null;

  const initials = `${(firstName?.[0] ?? "")}${(lastName?.[0] ?? "")}`.toUpperCase() || "U";
  const fullName = firstName || lastName ? `${firstName ?? ""} ${lastName ?? ""}`.trim() : "Student";

  // Confidence breakdown — only render when the user has rated at least one.
  const confidenceCounts = { guess: 0, likely: 0, certain: 0 };
  Object.values(confidence).forEach((c) => { confidenceCounts[c]++; });
  const confidenceTotal = confidenceCounts.guess + confidenceCounts.likely + confidenceCounts.certain;
  const confidenceRows = [
    { key: "certain", label: "Certain", count: confidenceCounts.certain, color: "bg-emerald-500" },
    { key: "likely",  label: "Likely",  count: confidenceCounts.likely,  color: "bg-amber-400"   },
    { key: "guess",   label: "Guess",   count: confidenceCounts.guess,   color: "bg-rose-500"    },
  ];

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 overflow-y-auto">
      {/* Profile card */}
      <div className="px-4 py-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <Avatar.Root className="w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-[#F7C948]/30">
            <Avatar.Fallback className="w-full h-full bg-linear-to-tr from-[#2B7FFF] to-[#615FFF] flex items-center justify-center text-white text-sm font-semibold font-inter">
              {initials}
            </Avatar.Fallback>
          </Avatar.Root>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">{fullName}</p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{email ?? "—"}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
          <div>
            <p className="uppercase tracking-wider text-[9px] font-semibold text-slate-400 dark:text-zinc-500">Preparing for</p>
            <p className="font-semibold text-slate-800 dark:text-zinc-100 mt-0.5">
              {preparingFor ?? examType}
            </p>
          </div>
          {planName ? (
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#5A3300] dark:text-amber-200 bg-[#F7C948] dark:bg-amber-500/20 px-2 py-1 rounded">
              {planName}
            </span>
          ) : (
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#894B00] dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded">
              Free
            </span>
          )}
        </div>
      </div>

      {/* Session details */}
      <div className="px-4 py-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400 mb-2">Session</p>
        <dl className="space-y-1.5 text-[11px]">
          <Row label="Exam"><span className="truncate">{examType}</span></Row>
          <Row label="Mode"><span className="capitalize">{sessionMode}</span></Row>
          <Row label="Difficulty"><span className="capitalize">{difficultyLevel}</span></Row>
          <Row label="Questions"><span className="tabular-nums">{totalQuestions}</span></Row>
          {isTimed && (
            <Row label="Remaining"><span className="tabular-nums font-mono">{timerDisplay}</span></Row>
          )}
        </dl>
      </div>

      {/* Live stats */}
      <div className="px-4 py-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400 mb-3">This session</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Tile color="emerald" label="Done" value={answered.size} />
          <Tile color="amber" label="Flag" value={flaggedCount} />
          <Tile color="slate" label="Left" value={totalQuestions - answered.size} />
        </div>

        {confidenceTotal > 0 && (
          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400 mb-2">Confidence</p>
            <div className="space-y-1.5">
              {confidenceRows.map((r) => (
                <div key={r.key}>
                  <div className="flex items-center justify-between text-[10px] mb-0.5">
                    <span className="text-slate-500 dark:text-zinc-400">{r.label}</span>
                    <span className="font-semibold text-slate-700 dark:text-zinc-300 tabular-nums">{r.count}</span>
                  </div>
                  <div className="h-1 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <div className={`h-full rounded-full ${r.color}`} style={{ width: `${(r.count / confidenceTotal) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Flagged */}
      <div className="px-4 py-4 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400">Flagged</p>
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 tabular-nums">{flaggedCount}</span>
        </div>
        {flaggedCount === 0 ? (
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 italic">No flagged questions yet.</p>
        ) : (
          <ul className="space-y-1">
            {Array.from(flagged).sort((a, b) => a - b).map((i) => (
              <li key={i}>
                <button
                  onClick={() => onJump(i)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] transition-colors ${
                    i === current
                      ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Flag size={10} fill="#D97706" className="text-amber-500 shrink-0" />
                  <span className="truncate">Q{i + 1} · {topicAt(i) || "—"}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-slate-500 dark:text-zinc-400">{label}</dt>
      <dd className="font-semibold text-slate-900 dark:text-zinc-100">{children}</dd>
    </div>
  );
}

function Tile({ color, label, value }: { color: "emerald" | "amber" | "slate"; label: string; value: number }) {
  const tone =
    color === "emerald"
      ? { bg: "bg-emerald-50 dark:bg-emerald-500/10", v: "text-emerald-700 dark:text-emerald-400", l: "text-emerald-700/70 dark:text-emerald-400/70" }
    : color === "amber"
      ? { bg: "bg-amber-50 dark:bg-amber-500/10", v: "text-amber-700 dark:text-amber-400", l: "text-amber-700/70 dark:text-amber-400/70" }
    :   { bg: "bg-slate-100 dark:bg-zinc-800", v: "text-slate-700 dark:text-zinc-200", l: "text-slate-500 dark:text-zinc-400" };
  return (
    <div className={`rounded-lg ${tone.bg} py-2`}>
      <p className={`text-lg font-semibold ${tone.v} tabular-nums leading-none`}>{value}</p>
      <p className={`text-[9px] uppercase tracking-wider ${tone.l} mt-1`}>{label}</p>
    </div>
  );
}
