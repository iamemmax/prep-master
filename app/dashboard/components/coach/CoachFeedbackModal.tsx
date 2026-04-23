"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Sparkles, X, Lightbulb, ArrowRight, RotateCw, Flame, Check,
  AlertTriangle, Target, BookOpen, Compass, Repeat,
} from "lucide-react";
import { useAIFeedback, useMistakeAnalysis, useWeaknessPlan } from "../../util/ai/useAIFeedback";
import {
  AIFeedback, AIFeedbackRequest,
  MistakeAnalysis, MistakeAnalysisRequest,
  WeaknessPlan, WeaknessPlanRequest,
} from "../../util/ai/types";
import ErrorCard from "./ErrorCard";

type TabKey = "overview" | "mistakes" | "plan";

export default function CoachFeedbackModal({
  open,
  onClose,
  overviewRequest,
  mistakesRequest,
  planRequest,
  onPracticeWrong,
}: {
  open: boolean;
  onClose: () => void;
  overviewRequest: AIFeedbackRequest | null;
  mistakesRequest: MistakeAnalysisRequest | null;
  planRequest: WeaknessPlanRequest | null;
  onPracticeWrong?: (questions: MistakeAnalysisRequest["questions"]) => void;
}) {
  const [tab, setTab] = useState<TabKey>("overview");

  // Each tab's data is only fetched when the modal is open AND that tab is
  // active — avoids building three mock payloads the user might never see.
  const overview = useAIFeedback(open && tab === "overview" ? overviewRequest : null);
  const mistakes = useMistakeAnalysis(open && tab === "mistakes" ? mistakesRequest : null);
  const plan     = useWeaknessPlan(open && tab === "plan" ? planRequest : null);

  const active = tab === "overview" ? overview
               : tab === "mistakes" ? mistakes
               : plan;

  const mistakesCount = mistakesRequest?.questions.length ?? 0;
  const planTopicsCount = planRequest?.topics.length ?? 0;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-0 gap-0 text-slate-900 dark:text-zinc-100 rounded-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
        style={{ maxWidth: 720 }}
      >
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-slate-100 dark:border-zinc-800 bg-linear-to-br from-amber-50 via-white to-orange-50 dark:from-amber-500/10 dark:via-zinc-900 dark:to-orange-500/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#F7C948] text-[#5A3300] shrink-0 shadow-sm">
                <Sparkles size={20} fill="currentColor" />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                  AI Coach
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                  Tailored to your last session. Not a grade — a plan.
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-zinc-800 transition-colors shrink-0"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-slate-100 dark:border-zinc-800 shrink-0 px-4 bg-white dark:bg-zinc-900">
          <TabButton active={tab === "overview"} onClick={() => setTab("overview")} icon={<Compass size={13} />}>
            Overview
          </TabButton>
          <TabButton active={tab === "mistakes"} onClick={() => setTab("mistakes")} icon={<AlertTriangle size={13} />} count={mistakesCount}>
            Mistakes
          </TabButton>
          <TabButton active={tab === "plan"} onClick={() => setTab("plan")} icon={<Target size={13} />} count={planTopicsCount}>
            Study plan
          </TabButton>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {tab === "overview" && (
            overview.error
              ? <ErrorCard onRetry={overview.refetch} retrying={overview.isLoading} />
              : overview.isLoading || !overview.data
                ? <LoadingState label="Analyzing your session…" />
                : <OverviewPanel data={overview.data} />
          )}
          {tab === "mistakes" && (
            mistakesCount === 0
              ? <EmptyState
                  icon={<Check size={28} className="text-emerald-500" />}
                  title="No mistakes to review"
                  body="Every answer was correct this session — enjoy the clean sheet."
                />
              : mistakes.error
                ? <ErrorCard onRetry={mistakes.refetch} retrying={mistakes.isLoading} />
                : mistakes.isLoading || !mistakes.data
                  ? <LoadingState label="Looking at your mistakes…" />
                  : <MistakesPanel
                      data={mistakes.data}
                      questionCount={mistakesCount}
                      onPractice={onPracticeWrong
                        ? () => {
                            if (mistakesRequest) onPracticeWrong(mistakesRequest.questions);
                            onClose();
                          }
                        : undefined}
                    />
          )}
          {tab === "plan" && (
            planTopicsCount === 0
              ? <EmptyState
                  icon={<Target size={28} className="text-[#F7C948]" />}
                  title="No weak topics yet"
                  body="Nothing stood out as a weakness this session. Keep running timed sessions to surface patterns."
                />
              : plan.error
                ? <ErrorCard onRetry={plan.refetch} retrying={plan.isLoading} />
                : plan.isLoading || !plan.data
                  ? <LoadingState label="Building your study plan…" />
                  : <PlanPanel data={plan.data} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-3 border-t border-slate-100 dark:border-zinc-800 shrink-0">
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 inline-flex items-center gap-1">
            <Sparkles size={11} className="text-[#F7C948]" />
            Generated by PrepMaster AI
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={active.refetch}
              disabled={active.isLoading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 h-9 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
            >
              <RotateCw size={12} className={active.isLoading ? "animate-spin" : ""} />
              Regenerate
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 h-9 rounded-lg bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Got it
              <Check size={12} strokeWidth={3} />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tab button ──────────────────────────────────────────────────────────────
function TabButton({
  active, onClick, icon, count, children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2.5 transition-colors ${
        active
          ? "text-slate-900 dark:text-zinc-100"
          : "text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
      }`}
    >
      {icon}
      {children}
      {count != null && count > 0 && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 tabular-nums">
          {count}
        </span>
      )}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F7C948]" />
      )}
    </button>
  );
}

// ─── Overview panel ──────────────────────────────────────────────────────────
function OverviewPanel({ data }: { data: AIFeedback }) {
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 mb-2">Summary</h3>
        <p className="text-base font-semibold text-slate-900 dark:text-zinc-100 leading-relaxed">{data.summary}</p>
      </section>

      <Section title="Key insights" icon={<Lightbulb size={12} className="text-[#F7C948]" />}>
        <ul className="space-y-2">
          {data.insights.map((item, i) => <BulletItem key={i}>{item}</BulletItem>)}
        </ul>
      </Section>

      <Section title="What to do next" icon={<ArrowRight size={12} />}>
        <ul className="space-y-2">
          {data.actions.map((item, i) => <NumberedItem key={i} index={i + 1}>{item}</NumberedItem>)}
        </ul>
      </Section>

      <MotivationBand>{data.motivation}</MotivationBand>
    </div>
  );
}

// ─── Mistakes panel ──────────────────────────────────────────────────────────
function MistakesPanel({
  data, questionCount, onPractice,
}: {
  data: MistakeAnalysis;
  questionCount: number;
  onPractice?: () => void;
}) {
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/40 dark:bg-rose-500/5 p-4">
        <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate-600 dark:text-zinc-300 mb-2 inline-flex items-center gap-1.5">
          <AlertTriangle size={12} className="text-rose-500" />
          Takeaway
        </h3>
        <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 leading-relaxed">{data.summary}</p>
      </section>

      {/* Re-attempt CTA — closes the analysis → action loop. */}
      {onPractice && questionCount > 0 && (
        <button
          onClick={onPractice}
          className="w-full inline-flex items-center justify-center gap-2 px-4 h-11 rounded-xl text-sm font-bold text-white transition-all hover:shadow-md hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #FE9A00, #FF6900)" }}
        >
          <Repeat size={14} />
          Practice these {questionCount} question{questionCount === 1 ? "" : "s"}
        </button>
      )}

      <Section title="Patterns we noticed" icon={<Compass size={12} />}>
        <ul className="space-y-2">
          {data.patterns.map((p, i) => <BulletItem key={i}>{p}</BulletItem>)}
        </ul>
      </Section>

      <Section title="Root causes" icon={<Lightbulb size={12} className="text-[#F7C948]" />}>
        <ul className="space-y-2">
          {data.root_causes.map((p, i) => <BulletItem key={i}>{p}</BulletItem>)}
        </ul>
      </Section>

      <Section title="Avoid next time" icon={<ArrowRight size={12} />}>
        <ul className="space-y-2">
          {data.avoid_next_time.map((p, i) => <NumberedItem key={i} index={i + 1}>{p}</NumberedItem>)}
        </ul>
      </Section>
    </div>
  );
}

// ─── Plan panel ──────────────────────────────────────────────────────────────
function PlanPanel({ data }: { data: WeaknessPlan }) {
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-[#F7C948]/50 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5 p-4">
        <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate-600 dark:text-zinc-300 mb-2 inline-flex items-center gap-1.5">
          <Target size={12} className="text-[#E17100]" />
          Start with
        </h3>
        <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 leading-relaxed">{data.start_with}</p>
      </section>

      <Section title="Practice plan" icon={<BookOpen size={12} />}>
        <ul className="space-y-3">
          {data.practice_plan.map((item, i) => (
            <li
              key={i}
              className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  {i + 1}. {item.topic}
                </p>
                <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F7C948] text-[#5A3300] tabular-nums">
                  {item.question_count} questions
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed mb-3">{item.focus}</p>
              {item.common_mistakes.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 mb-1.5">Common mistakes</p>
                  <ul className="space-y-1">
                    {item.common_mistakes.map((m, j) => (
                      <li key={j} className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
                        <span className="w-1 h-1 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <MotivationBand>{data.strategy}</MotivationBand>
    </div>
  );
}

// ─── Shared UI bits ──────────────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 mb-2 inline-flex items-center gap-1.5">
        {icon}{title}
      </h3>
      {children}
    </section>
  );
}

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40">
      <span className="w-1.5 h-1.5 rounded-full bg-[#F7C948] shrink-0 mt-2" />
      <span className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">{children}</span>
    </li>
  );
}

function NumberedItem({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F7C948] text-[#5A3300] font-bold text-xs tabular-nums shrink-0">
        {index}
      </span>
      <span className="text-sm text-slate-700 dark:text-zinc-200 leading-relaxed flex-1">{children}</span>
    </li>
  );
}

function MotivationBand({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-linear-to-br from-[#FFFBEB] to-[#FFF7ED] dark:from-amber-500/10 dark:to-orange-500/10 border border-[#FEE685] dark:border-amber-500/30">
      <Flame size={16} className="text-[#E17100] shrink-0 mt-0.5" fill="currentColor" />
      <p className="text-sm font-medium text-[#5A3300] dark:text-amber-200 leading-relaxed">{children}</p>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  const bar = "bg-slate-100 dark:bg-zinc-800 animate-pulse";
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
        <Sparkles size={13} className="text-[#F7C948] animate-pulse" />
        {label}
      </div>
      <div className={`h-16 rounded-xl ${bar}`} />
      <div className="space-y-2">
        <div className={`h-12 rounded-lg ${bar}`} />
        <div className={`h-12 rounded-lg ${bar}`} />
        <div className={`h-12 rounded-lg ${bar}`} />
      </div>
      <div className={`h-14 rounded-xl ${bar}`} />
    </div>
  );
}

function EmptyState({
  icon, title, body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mb-1">{title}</p>
      <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs leading-relaxed">{body}</p>
    </div>
  );
}
