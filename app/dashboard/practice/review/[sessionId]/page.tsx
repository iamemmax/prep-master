"use client";

import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Check, X as XIcon, Flag, Sparkles,
  Clock3, BookOpen,  AlertTriangle, RotateCw,
} from "lucide-react";
import DashboardHeader from "@/app/dashboard/components/dashboard/DashboardHeader";
import { useQuestionAnalysis } from "@/app/dashboard/util/ai/useAIFeedback";
import { useGetSessionReview } from "@/app/dashboard/util/apis/practice/sessionReview";
import { ReviewQuestion, QuestionAnalysisRequest } from "@/app/dashboard/util/ai/types";
import ErrorCard from "@/app/dashboard/components/coach/ErrorCard";
import { TourAutoStart } from "@/app/dashboard/util/tour/TourContext";

type FilterKey = "all" | "wrong" | "correct" | "skipped";

export default function ReviewPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const { data, isLoading, error, refetch } = useGetSessionReview(sessionId);
  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = useMemo(() => {
    const qs = data?.questions ?? [];
    return {
      all: qs.length,
      wrong: qs.filter(q => !q.is_correct && q.selected_answer !== null).length,
      correct: qs.filter(q => q.is_correct).length,
      skipped: qs.filter(q => q.selected_answer === null).length,
    };
  }, [data]);

  const visible = useMemo(() => {
    const qs = data?.questions ?? [];
    if (filter === "wrong")   return qs.filter(q => !q.is_correct && q.selected_answer !== null);
    if (filter === "correct") return qs.filter(q => q.is_correct);
    if (filter === "skipped") return qs.filter(q => q.selected_answer === null);
    return qs;
  }, [data, filter]);

  if (isLoading || !data) {
    return (
      <div className="bg-slate-50 dark:bg-zinc-950 min-h-screen">
        <DashboardHeader />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <LoadingSkeleton />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-50 dark:bg-zinc-950 min-h-screen">
        <DashboardHeader />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <ErrorCard title="Couldn't load review" onRetry={refetch} retrying={isLoading} />
        </main>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-zinc-950 min-h-screen text-slate-900 dark:text-zinc-100 font-inter">
      <DashboardHeader />
      <TourAutoStart tourId="review" />

      {/* Sticky review header — pinned just below the DashboardHeader (which
          is itself sticky at top-0). Holds the back link, exam title + score,
          and the filter pills so they stay accessible while questions scroll. */}
      <div className="sticky top-15 lg:top-16 z-30 bg-slate-50/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-3 pb-2.5 sm:pt-4 sm:pb-3">
          {/* Top row: back link + score */}
          <div className="flex items-center justify-between gap-3 mb-2.5 sm:mb-3">
            <button
              onClick={() => router.push("/dashboard/practice")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">Back to practice</span>
              <span className="sm:hidden">Back</span>
            </button>
            <div className="flex items-baseline gap-1.5 shrink-0">
              <span className="text-2xl sm:text-[28px] font-black tabular-nums text-slate-900 dark:text-zinc-100 leading-none">
                {Math.round(data.score)}
                <span className="text-sm sm:text-base text-slate-400 font-medium ml-0.5">%</span>
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                · {data.correct_answers}/{data.total_questions}
              </span>
            </div>
          </div>

          {/* Title row — exam pill + heading + submitted timestamp inline */}
          <div className="flex items-center gap-2 mb-2.5 sm:mb-3 min-w-0">
            <span className="inline-flex items-center h-6 px-2 rounded bg-[#F7C948] text-[#5A3300] font-black text-[10px] tracking-tight shrink-0">
              {data.exam_type.toUpperCase()}
            </span>
            <h1 className="text-sm sm:text-base font-bold tracking-tight truncate text-slate-900 dark:text-zinc-100">
              Session answer key
            </h1>
            <span className="hidden sm:inline text-[11px] text-slate-400 dark:text-zinc-500 truncate">
              · Submitted {new Date(data.submitted_at).toLocaleDateString()}
            </span>
          </div>

          {/* Filter pills */}
          <div
            data-tour="review-filters"
            className="flex items-center gap-1.5 overflow-x-auto -mx-1 px-1 pb-0.5"
            style={{ scrollbarWidth: "none" }}
          >
            <FilterPill active={filter === "all"}     onClick={() => setFilter("all")}     label="All"     count={counts.all}     tone="neutral" />
            <FilterPill active={filter === "wrong"}   onClick={() => setFilter("wrong")}   label="Wrong"   count={counts.wrong}   tone="wrong" />
            <FilterPill active={filter === "correct"} onClick={() => setFilter("correct")} label="Correct" count={counts.correct} tone="ok" />
            <FilterPill active={filter === "skipped"} onClick={() => setFilter("skipped")} label="Skipped" count={counts.skipped} tone="warn" />
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {visible.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <Check size={28} className="text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">Nothing in this filter</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Try switching filters to see more questions.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visible.map((q, i) => (
              <div key={q.id} data-tour={i === 0 ? "review-card" : undefined}>
                <QuestionCard question={q} index={i} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Question card ───────────────────────────────────────────────────────────
function QuestionCard({ question, index }: { question: ReviewQuestion; index: number }) {
  const [showAI, setShowAI] = useState(false);
  const skipped = question.selected_answer === null;
  const correct = question.is_correct;

  const statusStyles = correct
    ? { stripe: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400", icon: <Check size={11} />, label: "Correct" }
    : skipped
    ? { stripe: "bg-slate-300 dark:bg-zinc-700", pill: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300", icon: <Flag size={11} />, label: "Skipped" }
    : { stripe: "bg-rose-500", pill: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400", icon: <XIcon size={11} />, label: "Wrong" };

  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <span aria-hidden className={`absolute left-0 top-0 h-full w-1 ${statusStyles.stripe}`} />
      <div className="pl-5 pr-5 py-5">
        {/* Meta row */}
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400">Q{index + 1}</span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${statusStyles.pill}`}>
              {statusStyles.icon}{statusStyles.label}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400">
              <BookOpen size={11} />{question.topic}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400 capitalize">
              {question.difficulty}
            </span>
          </div>
          {question.time_spent_sec != null && (
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 dark:text-zinc-500 tabular-nums">
              <Clock3 size={10} />{question.time_spent_sec}s
            </span>
          )}
        </div>

        {/* Question stem */}
        <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 leading-relaxed mb-4">
          {question.text}
        </p>

        {/* Options */}
        <ul className="space-y-2 mb-4">
          {question.options.map(opt => {
            const isCorrect  = opt.label === question.correct_answer;
            const isSelected = opt.label === question.selected_answer;
            const state = isCorrect
              ? "correct"
              : isSelected && !isCorrect
                ? "wrong-pick"
                : "neutral";
            return (
              <li
                key={opt.label}
                className={`flex items-start gap-3 pl-2 pr-3 py-2 rounded-lg border ${
                  state === "correct"
                    ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/5"
                    : state === "wrong-pick"
                    ? "border-rose-200 bg-rose-50/60 dark:border-rose-500/30 dark:bg-rose-500/5"
                    : "border-slate-200 dark:border-zinc-800"
                }`}
              >
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-[11px] shrink-0 ${
                  state === "correct"
                    ? "bg-emerald-500 text-white"
                    : state === "wrong-pick"
                    ? "bg-rose-500 text-white"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                }`}>
                  {opt.label}
                </span>
                <span className={`flex-1 text-sm leading-relaxed ${
                  state === "correct"
                    ? "text-emerald-900 dark:text-emerald-100 font-semibold"
                    : state === "wrong-pick"
                    ? "text-rose-900 dark:text-rose-100 line-through decoration-rose-400/50"
                    : "text-slate-700 dark:text-zinc-300"
                }`}>
                  {opt.text}
                </span>
                {state === "correct" && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 self-center">Correct</span>
                )}
                {state === "wrong-pick" && (
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 shrink-0 self-center">Your pick</span>
                )}
              </li>
            );
          })}
        </ul>

        {/* Base explanation */}
        <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40 p-3 mb-3">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 mb-1">Explanation</p>
          <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">{question.explanation}</p>
        </div>

        {/* AI deeper analysis toggle */}
        {/* <button
          data-tour={index === 0 ? "review-ai" : undefined}
          onClick={() => setShowAI(v => !v)}
          className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 h-9 rounded-md border border-[#F7C948]/60 dark:border-amber-500/40 bg-[#FFFBEB] dark:bg-amber-500/10 text-[#5A3300] dark:text-amber-200 hover:bg-[#FEF3C7] dark:hover:bg-amber-500/20 transition-colors"
        >
          <Sparkles size={12} className="text-[#E17100]" fill="currentColor" />
          {showAI ? "Hide AI deeper explanation" : "Get AI deeper explanation"}
          {showAI ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button> */}

        {/* AI analysis panel */}
        {/* {showAI && <AIExplanationPanel question={question} />} */}
      </div>
    </article>
  );
}

// ─── AI deeper explanation ───────────────────────────────────────────────────
function AIExplanationPanel({ question }: { question: ReviewQuestion }) {
  const req: QuestionAnalysisRequest = {
    question_id: question.id,
    question_text: question.text,
    options: question.options,
    correct_answer: question.correct_answer,
    selected_answer: question.selected_answer ?? undefined,
    topic: question.topic,
    base_explanation: question.explanation,
  };
  const { data, isLoading, error, refetch } = useQuestionAnalysis(req);

  if (error) {
    return (
      <div className="mt-3 rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50/60 dark:bg-rose-500/5 p-3 flex items-start gap-2">
        <AlertTriangle size={14} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-800 dark:text-zinc-100">Couldn&apos;t generate deeper explanation</p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Try again in a moment.</p>
        </div>
        <button
          onClick={refetch}
          className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold px-2 h-7 rounded-md border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-white/60 dark:hover:bg-rose-500/10 transition-colors"
        >
          <RotateCw size={10} />
          Retry
        </button>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="mt-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40 p-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mb-3">
          <Sparkles size={12} className="text-[#F7C948] animate-pulse" />
          Building deeper explanation…
        </div>
        <div className="space-y-2">
          <div className="h-3 rounded-full w-full bg-slate-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-3 rounded-full w-5/6 bg-slate-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-3 rounded-full w-2/3 bg-slate-100 dark:bg-zinc-800 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-[#F7C948]/40 dark:border-amber-500/30 bg-linear-to-br from-[#FFFBEB] to-white dark:from-amber-500/5 dark:to-zinc-900 p-4 space-y-3">
      <AIField title="Why the correct answer is right">{data.why_correct}</AIField>
      {data.why_wrong && <AIField title="Why your pick was wrong" tone="rose">{data.why_wrong}</AIField>}
      <div>
        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-600 dark:text-zinc-400 mb-1.5">Common pitfalls</p>
        <ul className="space-y-1">
          {data.common_pitfalls.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
              <span className="w-1 h-1 rounded-full bg-rose-400 shrink-0 mt-1.5" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
      <AIField title="Alternative way to think about it">{data.alt_explanation}</AIField>
      <AIField title="Practice next">{data.related_practice}</AIField>
    </div>
  );
}

function AIField({ title, children, tone }: { title: string; children: React.ReactNode; tone?: "rose" }) {
  return (
    <div>
      <p className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${
        tone === "rose" ? "text-rose-600 dark:text-rose-300" : "text-slate-600 dark:text-zinc-400"
      }`}>{title}</p>
      <p className="text-xs text-slate-700 dark:text-zinc-200 leading-relaxed">{children}</p>
    </div>
  );
}

// ─── Filter pill ─────────────────────────────────────────────────────────────
function FilterPill({
  active, onClick, label, count, tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  tone: "wrong" | "warn" | "ok" | "neutral";
}) {
  const activeStyle =
    tone === "wrong" ? "bg-rose-500 text-white border-rose-500"
    : tone === "warn"  ? "bg-amber-500 text-white border-amber-500"
    : tone === "ok"    ? "bg-emerald-500 text-white border-emerald-500"
    :                    "bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-slate-900 dark:border-zinc-100";

  // When tone is "neutral" and dark mode is on, the active button background is
  // light (zinc-100), so the count badge needs dark text for contrast. Colored
  // tones (wrong/warn/ok) stay the same in both modes.
  const activeCountStyle =
    tone === "neutral"
      ? "bg-white/25 text-white dark:bg-zinc-900/15 dark:text-zinc-900"
      : "bg-white/25 text-white";

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 h-8 rounded-md border transition-colors ${
        active
          ? activeStyle
          : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
      }`}
    >
      {label}
      <span className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded ${
        active ? activeCountStyle : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300"
      }`}>
        {count}
      </span>
    </button>
  );
}

// ─── Loading state ───────────────────────────────────────────────────────────
function LoadingSkeleton() {
  const bar = "bg-slate-100 dark:bg-zinc-800 animate-pulse";
  return (
    <div className="space-y-4">
      <div className={`h-8 rounded-md w-40 ${bar}`} />
      <div className={`h-6 rounded-md w-64 ${bar}`} />
      <div className="flex gap-2 mt-4">
        <div className={`h-8 rounded-md w-20 ${bar}`} />
        <div className={`h-8 rounded-md w-20 ${bar}`} />
        <div className={`h-8 rounded-md w-20 ${bar}`} />
      </div>
      <div className="space-y-4 mt-6">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-48 rounded-2xl ${bar}`} />
        ))}
      </div>
    </div>
  );
}
