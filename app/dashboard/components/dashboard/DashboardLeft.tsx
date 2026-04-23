"use client"
import React, { useState } from 'react'
import { Star, Calendar, Clock, X, ChevronRight, CheckCircle2, PlayCircle, BookOpen } from 'lucide-react';
import * as Progress from "@radix-ui/react-progress";
import Unlockicon from '@/utils/icons/UnlockIcon';
import { getScoreAccent } from '@/utils/color/getPercentageColor';
import { useGetPracticeHistory } from '../../util/apis/dashboard/practiceHistory';
import { practiceHistoryData } from '../../util/types/dashboard/practiceHistoryTypes';
import { useRouter } from 'next/navigation';
import { dashboardOverviewData } from '../../util/types/dashboard/dashbaordOverview';
import { useAuth } from '@/context/authentication';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import UpgradeModal from '../upgrade/UpgradeModal';

function ScoreBar({ score }: { score: number }) {
  const accent = getScoreAccent(score);
  return (
    <Progress.Root className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden mt-3" value={score}>
      <Progress.Indicator
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${score}%`, background: accent }}
      />
    </Progress.Root>
  );
}

function TestCard({ test }: { test: practiceHistoryData }) {
  const router = useRouter();
  const subjectNames = test.subjects_selected.map((s) => s.name).join(", ") || "Mixed subjects";
  const topicCount   = test.topics_selected.length;
  const date         = new Date(test.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const score        = test.score ?? 0;
  const duration     = test.time_limit_minutes ? `${test.time_limit_minutes}m` : "untimed";
  const isCompleted  = test.status === "completed";
  const accent       = isCompleted ? getScoreAccent(score) : "#F7C948";

  return (
    <button
      onClick={() => router.push(`/dashboard/practice/start-practice/${test.id}`)}
      className="w-full text-left relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 mb-3 p-4 transition-all hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F7C948]/40"
    >
      <span aria-hidden className="absolute top-0 left-0 h-full w-1" style={{ background: accent }} />
      <div className="flex items-start justify-between gap-4 pl-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">{subjectNames}</p>
            <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
              isCompleted
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
            }`}>
              {isCompleted
                ? <><CheckCircle2 size={9} /> Done</>
                : <><PlayCircle size={9} /> In progress</>}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap text-[11px] text-slate-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1 tabular-nums"><Calendar size={11} />{date}</span>
            <span className="inline-flex items-center gap-1 tabular-nums"><Clock size={11} />{duration}</span>
            <span className="inline-flex items-center gap-1"><BookOpen size={11} />{topicCount} topic{topicCount === 1 ? "" : "s"}</span>
            <span className="capitalize">· {test.difficulty_level}</span>
          </div>
        </div>
        <div className="text-right shrink-0 flex items-center gap-2">
          {isCompleted ? (
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tabular-nums leading-none" style={{ color: accent }}>
                {score.toFixed(0)}<span className="text-sm text-slate-400 dark:text-zinc-500 font-medium">%</span>
              </p>
            </div>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Resume</span>
          )}
          <ChevronRight size={16} className="text-slate-300 dark:text-zinc-600" />
        </div>
      </div>
      {isCompleted && <div className="pl-2"><ScoreBar score={score} /></div>}
    </button>
  );
}

function SkeletonCard() {
  const bar = "bg-slate-100 dark:bg-zinc-800 animate-pulse";
  return (
    <div className="rounded-xl border mb-3 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <div className={`h-4 rounded-full w-2/3 ${bar}`} />
          <div className={`h-3 rounded-full w-1/3 ${bar}`} />
          <div className="flex items-center gap-3 mt-2">
            <div className={`h-3 rounded-full w-16 ${bar}`} />
            <div className={`h-3 rounded-full w-24 ${bar}`} />
          </div>
        </div>
        <div className="shrink-0 space-y-1.5 text-right">
          <div className={`h-7 rounded-full w-12 ml-auto ${bar}`} />
        </div>
      </div>
      <div className={`h-1.5 rounded-full w-full mt-4 ${bar}`} />
    </div>
  );
}

function CountdownCard({
  overview,
  examName,
  examDate,
}: {
  overview: dashboardOverviewData | undefined;
  examName?: string;
  examDate?: string | null;
}) {
  const days = overview?.days_remaining ?? 0;
  const readiness = Math.max(0, Math.min(100, Math.round(overview?.overall_readiness ?? 0)));
  const target = overview?.target_score ?? "—";

  // Three urgency tiers drive the whole card palette.
  const tier =
    days <= 7  ? { label: "Final stretch", hex: "#DC2626", soft: "bg-rose-50 dark:bg-rose-500/10",  softTxt: "text-rose-600 dark:text-rose-300",  ring: "ring-rose-200 dark:ring-rose-500/30" }
    : days <= 30 ? { label: "Getting close", hex: "#D97706", soft: "bg-amber-50 dark:bg-amber-500/10", softTxt: "text-amber-700 dark:text-amber-300", ring: "ring-amber-200 dark:ring-amber-500/30" }
    :              { label: "On track",      hex: "#059669", soft: "bg-emerald-50 dark:bg-emerald-500/10", softTxt: "text-emerald-700 dark:text-emerald-300", ring: "ring-emerald-200 dark:ring-emerald-500/30" };

  const formattedDate = examDate
    ? new Date(examDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "Not set";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center h-7 px-2.5 rounded-md bg-[#F7C948] text-[#5A3300] font-black text-xs tracking-tight shrink-0">
            {String(examName ?? "EXAM").toUpperCase()}
          </span>
          <span className="text-sm font-semibold text-slate-700 dark:text-zinc-200">countdown</span>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${tier.soft} ${tier.softTxt}`}>
          {tier.label}
        </span>
      </div>

      <div className="flex items-center gap-5">
        <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-full ring-4 ${tier.ring} bg-slate-50 dark:bg-zinc-950 shrink-0`}>
          <p className="text-3xl font-black tabular-nums leading-none" style={{ color: tier.hex }}>{days}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 mt-1">days</p>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-1">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400">Readiness</p>
            <p className="text-xs font-bold text-slate-800 dark:text-zinc-100 tabular-nums">{readiness}%</p>
          </div>
          <Progress.Root className="h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
            <Progress.Indicator className="h-full rounded-full transition-all duration-700" style={{ width: `${readiness}%`, background: tier.hex }} />
          </Progress.Root>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">
            {readiness >= 80 ? "You're exam-ready. Lock in with a timed mock."
            : readiness >= 50 ? "Solid base — target your weakest topic next."
            : "Plenty of room to grow. Try a short focused session."}
          </p>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-2 gap-4 text-xs">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400 mb-0.5">Exam date</p>
          <p className="font-semibold text-slate-800 dark:text-zinc-100">{formattedDate}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400 mb-0.5">Target score</p>
          <p className="font-semibold text-slate-800 dark:text-zinc-100 tabular-nums">{target}{typeof target === "number" || /^\d+$/.test(String(target)) ? "%" : ""}</p>
        </div>
      </div>
    </div>
  );
}

interface prop {
  overview: dashboardOverviewData | undefined
}

const DashboardLeft = ({ overview }: prop) => {
  const [showAllModal, setShowAllModal] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [page, setPage] = useState(1)
  const { data, isLoading } = useGetPracticeHistory(page)
const {authState:{user}}=useAuth()
  const allTests    = data?.data ?? []
  const recentTests = allTests.slice(0, 5)
  const totalCount  = data?.count ?? 0
  const hasNext     = !!data?.next
  const hasPrev     = !!data?.previous

  return (
    <div className="lg:col-span-2 flex flex-col gap-6">

      {/* Cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Unlock card */}
        <div
          className="relative border border-[#FEE685] rounded-2xl p-8 overflow-hidden"
          style={{ background: "linear-gradient(to right, #FFFBEB, #FFF7ED)" }}
        >
          <div className="absolute right-0 h-full w-full bottom-0 opacity-80 pointer-events-none select-none flex items-end justify-end pr-2 pb-2">
            <Unlockicon className='' />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Star size={15} className="text-amber-500 fill-amber-400" />
            <h3 className="font-bold text-[#314158] text-sm lg:text-base">Unlock Your Full Potential</h3>
          </div>
          <p className="text-xs text-[#314158] font-inter mb-3 leading-5">
            Get unlimited access to all 17,000 questions, advanced analytics, and personalized study plans with Premium.
          </p>
          <ul className="space-y-1.5 mb-4">
            {["Unlimited practice attempts", "Access to all premium questions", "Detailed performance analytics", "Custom study plans"].map(f => (
              <li key={f} className="flex items-center font-inter gap-3 text-xs text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />{f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setShowUpgrade(true)}
            className="px-5 py-2 rounded-[.5275rem] bg-linear-to-r from-[#FE9A00] to-[#FF6900] text-white text-xs font-bold hover:shadow-md transition-shadow cursor-pointer"
          >
            Upgrade Now
          </button>
        </div>

        {/* Countdown card */}
        <CountdownCard overview={overview} examName={user?.exam_config?.preparing_for_exam} examDate={user?.exam_config?.exam_date ?? null} />
      </div>

      {/* Recent Practice Tests */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 max-md:p-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 tracking-tight">Recent practice tests</h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Your last {Math.min(5, totalCount)} sessions</p>
          </div>
          {totalCount > 5 && (
            <button
              onClick={() => setShowAllModal(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 h-8 rounded-md border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
            >
              View all
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 tabular-nums">{totalCount}</span>
            </button>
          )}
        </div>

        {isLoading ? (
          <div>{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : recentTests.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-slate-400 dark:text-zinc-500 italic">No practice tests yet — start one to see it here.</p>
          </div>
        ) : (
          <div>{recentTests.map(test => <TestCard key={`${test.id}-${test.updated_at}`} test={test} />)}</div>
        )}
      </div>

      {/* ── View All Modal ── */}
      <Dialog
        open={showAllModal}
        onOpenChange={v => { if (!v) { setShowAllModal(false); setPage(1); } }}
      >
        <DialogContent
          showCloseButton={false}
          className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-0 gap-0 text-slate-900 dark:text-zinc-100 rounded-2xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl"
          style={{ maxWidth: 720 }}
        >
          {/* modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-zinc-100">
                All practice tests
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                {totalCount} session{totalCount === 1 ? "" : "s"} total
              </DialogDescription>
            </div>
            <button
              onClick={() => { setShowAllModal(false); setPage(1); }}
              className="text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* modal body */}
          <div className="overflow-y-auto flex-1 px-6 py-4 bg-slate-50/50 dark:bg-zinc-950/50">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              : allTests.length === 0
                ? <p className="text-center text-sm text-slate-400 dark:text-zinc-500 italic py-10">No sessions on this page.</p>
                : allTests.map(test => <TestCard key={`modal-${test.id}-${test.updated_at}`} test={test} />)
            }
          </div>

          {/* pagination footer */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-zinc-800 shrink-0">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={!hasPrev}
              className="text-xs font-semibold px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ← Previous
            </button>
            <span className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!hasNext}
              className="text-xs font-semibold px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />

    </div>
  );
};

export default DashboardLeft;