"use client";

import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { SmallSpinner } from "@/components/ui/Spinner";

export default function SessionDock({
  total,
  current,
  answered,
  flagged,
  flaggedCount,
  isFinishing,
  onJump,
  onPrev,
  onNext,
  onFinish,
}: {
  total: number;
  current: number;
  answered: Set<number>;
  flagged: Set<number>;
  flaggedCount: number;
  isFinishing: boolean;
  onJump: (i: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
}) {
  const onLast = current === total - 1;

  return (
    <footer data-tour="session-footer" className="bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 shrink-0">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-2.5">
        <div className="flex-1 flex items-center justify-center overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <div className="flex items-center gap-1.5 min-w-max px-2">
            {Array.from({ length: total }, (_, i) => {
              const isCur = i === current;
              const isAns = answered.has(i);
              const isFlg = flagged.has(i);
              return (
                <button
                  key={i}
                  onClick={() => onJump(i)}
                  title={`Q${i + 1}${isAns ? " · answered" : ""}${isFlg ? " · flagged" : ""}`}
                  className={`relative rounded-full transition-all ${
                    isCur
                      ? "w-6 h-2 bg-[#F7C948]"
                      : isAns
                      ? "w-2 h-2 bg-emerald-500 hover:scale-125"
                      : "w-2 h-2 bg-slate-300 dark:bg-zinc-700 hover:bg-slate-400 dark:hover:bg-zinc-600"
                  }`}
                >
                  {isFlg && !isCur && (
                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-amber-400 ring-2 ring-white dark:ring-zinc-900" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <p className="hidden md:block text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums shrink-0">
          <span className="font-semibold text-slate-700 dark:text-zinc-300">{answered.size}</span> answered
          {flaggedCount > 0 && <span> · <span className="font-semibold text-amber-600 dark:text-amber-400">{flaggedCount}</span> flagged</span>}
        </p>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onPrev}
            disabled={current === 0}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-xs font-bold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} />
            Prev
          </button>
          <button
            onClick={onLast ? onFinish : onNext}
            disabled={isFinishing}
            className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-xs font-bold transition-colors ${
              onLast
                ? "bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60"
                : "bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-zinc-200"
            }`}
          >
            {onLast ? (
              <>{isFinishing ? <SmallSpinner /> : <>Finish <Check size={14} strokeWidth={2.6} /></>}</>
            ) : <>Next <ChevronRight size={14} /></>}
          </button>
        </div>
      </div>
    </footer>
  );
}
