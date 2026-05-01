"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Sparkles, Eye, Download, ListChecks } from "lucide-react";
import { SmallSpinner } from "@/components/ui/Spinner";
import { StoredProctorReport, downloadProctorPDF, openProctorPDF } from "../../../util/proctor/report";
import { isProductionGated } from "@/components/shared/coming-soon-gate";

export interface SessionResultDialogProps {
  /** Score breakdown returned by the end-session API. Pass `null` to keep the dialog closed. */
  result: { score: number; correct_answers: number; total_questions: number } | null;
  celebrate: boolean;
  prevBest: number | null;
  proctorReport: StoredProctorReport | null;
  /** Has the AI coach payload been built? Drives whether the coach CTA shows. */
  coachReady: boolean;
  onOpenCoach: () => void;
  onReview: () => void;
  isNavigatingToReview: boolean;
  onProgress: () => void;
  onBackToPractice: () => void;
}

export default function SessionResultDialog({
  result,
  celebrate,
  prevBest,
  proctorReport,
  coachReady,
  onOpenCoach,
  onReview,
  isNavigatingToReview,
  onProgress,
  onBackToPractice,
}: SessionResultDialogProps) {
  const open = !!result;

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md max-h-[90dvh] overflow-y-auto bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 p-0 gap-0"
      >
        {result && (() => {
          const pct = result.score;
          const tone =
            pct >= 75 ? "emerald" :
            pct >= 50 ? "amber" : "rose";
          const ringColor =
            tone === "emerald" ? "#10b981" :
            tone === "amber"   ? "#F7C948" : "#f43f5e";
          const R = 52;
          const C = 2 * Math.PI * R;

          return (
            <>
              {/* HERO — score ring */}
              <div
                className={cn(
                  "relative px-6 pt-8 pb-6 text-center transition-colors",
                  celebrate
                    ? "bg-linear-to-b from-amber-50 to-transparent dark:from-amber-500/10"
                    : "bg-linear-to-b from-slate-50/50 to-transparent dark:from-zinc-800/30"
                )}
              >
                <DialogHeader className="items-center text-center sm:text-center mb-5">
                  <DialogTitle className="text-[13px] font-medium text-slate-500 dark:text-zinc-400 tracking-wide">
                    {celebrate ? "🎉  New personal best!" : "Session complete"}
                  </DialogTitle>
                  <DialogDescription className="sr-only">Your session results</DialogDescription>
                </DialogHeader>

                {/* Circular score */}
                <div className="relative inline-flex items-center justify-center w-32 h-32 mx-auto">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120" aria-hidden>
                    <circle
                      cx="60" cy="60" r={R}
                      strokeWidth="8"
                      fill="none"
                      className="stroke-slate-100 dark:stroke-zinc-800"
                    />
                    <circle
                      cx="60" cy="60" r={R}
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="none"
                      stroke={ringColor}
                      strokeDasharray={C}
                      strokeDashoffset={C * (1 - pct / 100)}
                      style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[32px] leading-none font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                      {Math.round(pct)}
                      <span className="text-lg text-slate-400 dark:text-zinc-500 ml-0.5">%</span>
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums mt-1.5">
                      {result.correct_answers} / {result.total_questions} correct
                    </span>
                  </div>
                </div>

                {/* Celebration subline */}
                {celebrate && (
                  <p className="text-xs text-slate-600 dark:text-zinc-300 mt-4">
                    {prevBest != null
                      ? <>Previous best: <span className="font-semibold tabular-nums">{prevBest.toFixed(0)}%</span></>
                      : <>First run on this exam — you set the bar.</>}
                  </p>
                )}
              </div>

              {/* ACTIONS */}
              <div className="px-6 pb-6 pt-1 flex flex-col gap-2">

                {/* Proctoring — compact inline row */}
                {proctorReport && (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/30 pl-3 pr-2 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        proctorReport.incidents.length === 0 ? "bg-emerald-500" : "bg-amber-500"
                      )} />
                      <p className="text-xs text-slate-700 dark:text-zinc-300 truncate whitespace-nowrap">
                        Proctoring · {proctorReport.incidents.length} incident{proctorReport.incidents.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => openProctorPDF(proctorReport)}
                        className="p-1.5 rounded-md text-slate-500 dark:text-zinc-400 hover:bg-white hover:text-slate-900 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 transition-colors"
                        aria-label="View proctoring report"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => downloadProctorPDF(proctorReport)}
                        className="p-1.5 rounded-md text-slate-500 dark:text-zinc-400 hover:bg-white hover:text-slate-900 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 transition-colors"
                        aria-label="Download proctoring report"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* AI coach — featured (gated in production) */}
                {!isProductionGated() && coachReady && (
                  <button
                    onClick={onOpenCoach}
                    className="group w-full h-11 rounded-lg text-sm font-semibold text-white inline-flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-orange-500/25 whitespace-nowrap"
                    style={{ background: "linear-gradient(135deg, #FE9A00, #FF6900)" }}
                  >
                    <Sparkles size={14} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
                    Get AI coach feedback
                  </button>
                )}

                {/* Secondary row: Review + Progress — Review must stay visible
                    in production; only Progress is behind the gate. */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={onReview}
                    disabled={isNavigatingToReview}
                    className="flex-1 h-10 rounded-lg text-sm font-semibold border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-70 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    {isNavigatingToReview ? (
                      <><SmallSpinner /> Loading…</>
                    ) : (
                      <><ListChecks size={14} /> Review</>
                    )}
                  </button>
                  {!isProductionGated() && (
                    <button
                      onClick={onProgress}
                      className="flex-1 h-10 rounded-lg text-sm font-semibold border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap"
                    >
                      Progress
                    </button>
                  )}
                </div>

                {/* Primary CTA */}
                <button
                  onClick={onBackToPractice}
                  className="w-full h-11 rounded-lg text-sm font-semibold bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors whitespace-nowrap"
                >
                  Back to practice
                </button>
              </div>
            </>
          );
        })()}
      </DialogContent>
    </Dialog>
  );
}
