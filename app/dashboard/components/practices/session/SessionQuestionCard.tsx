"use client";

import { Clock3, Flag, Zap, Check, X as XIcon } from "lucide-react";

type Confidence = "guess" | "likely" | "certain";

interface QuestionViewModel {
  text: string;
  options: { id: number; option_text: string }[];
  topic: { name: string } | null;
  subject?: { name: string } | null;
  difficulty_level: string;
  explanation?: string;
}

export default function SessionQuestionCard({
  question,
  current,
  total,
  selectedAnswer,
  eliminatedSet,
  isCurrentFlagged,
  curConfidence,
  paceFg,
  paceLabel,
  qTimeLabel,
  targetPerQ,
  showExplanation,
  onSelectOption,
  onToggleEliminate,
  onToggleFlag,
  onSetConfidence,
}: {
  question: QuestionViewModel;
  current: number;
  total: number;
  selectedAnswer: number | null;
  eliminatedSet: Set<number>;
  isCurrentFlagged: boolean;
  curConfidence: Confidence | undefined;
  paceFg: string;
  paceLabel: string;
  qTimeLabel: string;
  targetPerQ: number;
  showExplanation: boolean;
  onSelectOption: (i: number) => void;
  onToggleEliminate: (i: number, e?: React.MouseEvent) => void;
  onToggleFlag: () => void;
  onSetConfidence: (level: Confidence) => void;
}) {
  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div data-tour="session-question" className="max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-10">

        {/* Meta row */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-zinc-500 font-semibold">
              Question {current + 1} of {total}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">{question.topic?.name ?? question.subject?.name ?? "General"}</p>
              <span className={`text-[10px] font-bold capitalize px-1.5 py-0.5 rounded ${
                question.difficulty_level === "easy"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : question.difficulty_level === "medium"
                  ? "bg-amber-50 text-[#894B00] dark:bg-amber-500/10 dark:text-amber-400"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
              }`}>
                {question.difficulty_level}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold h-7 px-2 rounded-md tabular-nums"
              style={{ color: paceFg, background: `${paceFg}1a` }}
              title={`Target ${Math.floor(targetPerQ / 60)}:${(targetPerQ % 60).toString().padStart(2, "0")} per question`}
            >
              <Clock3 size={10} />
              {qTimeLabel}
              <span className="hidden md:inline text-[8px] uppercase tracking-wider opacity-80">· {paceLabel}</span>
            </span>
            <button
              onClick={onToggleFlag}
              className={`inline-flex items-center gap-1 h-7 px-2 rounded-md text-[10px] font-bold transition-colors ${
                isCurrentFlagged
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                  : "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
              }`}
            >
              <Flag size={10} fill={isCurrentFlagged ? "currentColor" : "transparent"} />
              <span className="hidden sm:inline">{isCurrentFlagged ? "Flagged" : "Flag"}</span>
            </button>
          </div>
        </div>

        {/* Question text */}
        <p className="text-[14px] sm:text-[17px] leading-[1.55] sm:leading-[1.7] text-slate-800 dark:text-zinc-200 mb-5 sm:mb-7 font-medium">
          {question.text}
        </p>

        {/* Options */}
        <div className="space-y-1.5 sm:space-y-2 mb-5 sm:mb-6">
          {question.options.map((opt, i) => {
            const isEliminated = eliminatedSet.has(i);
            const isSelected   = selectedAnswer === i;
            return (
              <div key={opt.id} className="group relative">
                <button
                  onClick={() => onSelectOption(i)}
                  className={`w-full flex items-center gap-2.5 sm:gap-4 pl-2.5 sm:pl-3 pr-9 sm:pr-10 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-[#F7C948] bg-amber-50/60 dark:bg-amber-500/10"
                      : isEliminated
                      ? "border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/60 opacity-55"
                      : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center shrink-0 text-[11px] sm:text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-[#F7C948] text-white"
                      : isEliminated
                      ? "bg-slate-100 dark:bg-zinc-800 text-slate-300 dark:text-zinc-600"
                      : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className={`flex-1 text-[13px] sm:text-[15px] leading-snug sm:leading-relaxed ${
                    isSelected
                      ? "text-slate-900 dark:text-zinc-100 font-semibold"
                      : isEliminated
                      ? "text-slate-400 dark:text-zinc-600 line-through decoration-rose-400/70"
                      : "text-slate-700 dark:text-zinc-300"
                  }`}>
                    {opt.option_text}
                  </span>
                  {isSelected && <Check size={14} className="text-[#894B00] dark:text-[#F7C948] shrink-0 sm:hidden" strokeWidth={3} />}
                  {isSelected && <Check size={16} className="text-[#894B00] dark:text-[#F7C948] shrink-0 hidden sm:block" strokeWidth={3} />}
                </button>
                <button
                  onClick={(e) => onToggleEliminate(i, e)}
                  title={isEliminated ? "Restore" : "Cross out this option"}
                  className={`absolute top-1/2 -translate-y-1/2 right-1.5 sm:right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center transition-all ${
                    isEliminated
                      ? "bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 opacity-100"
                      : "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-400"
                  }`}
                >
                  <XIcon size={12} strokeWidth={2.2} className="sm:hidden" />
                  <XIcon size={13} strokeWidth={2.2} className="hidden sm:block" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Confidence capture */}
        {selectedAnswer !== null && (
          <div data-tour="session-confidence" className="flex items-center justify-between gap-3 flex-wrap pt-4 border-t border-slate-200 dark:border-zinc-800">
            <p className="text-xs font-semibold text-slate-600 dark:text-zinc-400 inline-flex items-center gap-1.5">
              <Zap size={12} className="text-[#F7C948]" />
              How confident?
            </p>
            <div className="inline-flex gap-0 border border-slate-200 dark:border-zinc-700 rounded-md overflow-hidden">
              {([
                { key: "guess",   label: "Guess"   },
                { key: "likely",  label: "Likely"  },
                { key: "certain", label: "Certain" },
              ] as const).map((o) => {
                const active = curConfidence === o.key;
                return (
                  <button
                    key={o.key}
                    onClick={() => onSetConfidence(o.key)}
                    className={`text-[11px] font-semibold px-3 py-1.5 transition-colors ${
                      active
                        ? "bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                        : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Explanation */}
        {showExplanation && selectedAnswer !== null && question.explanation && (
          <div className="mt-5 rounded-lg border border-slate-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
              Explanation
            </p>
            <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
