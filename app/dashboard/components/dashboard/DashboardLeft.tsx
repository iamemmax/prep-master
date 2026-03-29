"use client"
import React, { useState } from 'react'
import { Star, Calendar, Clock, X } from 'lucide-react';
import * as Progress from "@radix-ui/react-progress";
import Unlockicon from '@/utils/icons/UnlockIcon';
import { getScoreAccent } from '@/utils/color/getPercentageColor';
import PrepLogo from '@/utils/icons/logos/PrepLogo';
import { useGetPracticeHistory } from '../../util/apis/dashboard/practiceHistory';
// import { dashboardOverviewData } from '../../util/types/dashboard/dashbaordOverview';
import { practiceHistoryData } from '../../util/types/dashboard/practiceHistoryTypes';
import { useRouter } from 'next/navigation';
import { dashboardOverviewData } from '../../util/types/dashboard/dashbaordOverview';
import { useAuth } from '@/context/authentication';

function ScoreBar({ score }: { score: number }) {
  const accent = getScoreAccent(score);
  return (
    <Progress.Root className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden mt-3" value={score}>
      <Progress.Indicator
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${score}%`, background: accent }}
      />
    </Progress.Root>
  );
}

function TestCard({ test }: { test:practiceHistoryData }) {
  const subjectNames = test.subjects_selected.map((s) => s.name).join(", ");
  const topicNames   = test.topics_selected.map((t) => t.name).join(", ");
  const date         = new Date(test.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const score        = test.score ?? 0;
  const duration     = test.time_limit_minutes ? `${test.time_limit_minutes} mins` : "—";
const router = useRouter()
  return (
    <div className="cursor-pointer group rounded-2xl border mb-3 border-[#E2E8F0] hover:scale-95 transition-all p-5"
    onClick={()=>router.push(`/dashboard/practice/start-practice/${test.id}`)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm lg:text-base font-medium text-[#0F172B] truncate">{subjectNames}</p>
          <p className="text-xs text-[#45556C] mt-0.5 mb-2">{date}</p>
          <div className="flex items-center font-inter gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-xs xl:text-sm text-[#45556C]">
              <Clock size={18} />{duration}
            </span>
            <span className="flex items-center gap-1 text-xs xl:text-sm text-[#45556C]">
              <PrepLogo color="#45556C" width={18} height={18} />{topicNames}
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
              test.status === "completed" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            }`}>
              {test.status.replace("_", " ")}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          {test.status === "completed" ? (
            <p className="text-2xl font-bold text-[#0F172B] font-inter leading-none">{score?.toFixed(0)}%</p>
          ) : (
            <p className="text-xs text-[#45556C] font-medium">In Progress</p>
          )}
          <p className="text-[10px] text-[#45556C] mt-1 capitalize">{test.difficulty_level}</p>
        </div>
      </div>
      {test.status === "completed" && <ScoreBar score={score} />}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border mb-3 border-[#E2E8F0] p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 bg-slate-100 rounded-full w-2/3" />
          <div className="h-3 bg-slate-100 rounded-full w-1/3" />
          <div className="flex items-center gap-3 mt-2">
            <div className="h-3 bg-slate-100 rounded-full w-16" />
            <div className="h-3 bg-slate-100 rounded-full w-24" />
            <div className="h-5 bg-slate-100 rounded-full w-16" />
          </div>
        </div>
        <div className="shrink-0 space-y-1.5 text-right">
          <div className="h-7 bg-slate-100 rounded-full w-12 ml-auto" />
          <div className="h-3 bg-slate-100 rounded-full w-10 ml-auto" />
        </div>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full w-full mt-4" />
    </div>
  );
}

interface prop {
  overview: dashboardOverviewData | undefined
}

const DashboardLeft = ({ overview }: prop) => {
  const [showAllModal, setShowAllModal] = useState(false)
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
          <button className="px-5 py-2 rounded-[.5275rem] bg-linear-to-r from-[#FE9A00] to-[#FF6900] text-white text-xs font-bold hover:shadow-md transition-shadow">
            Upgrade Now
          </button>
        </div>

        {/* Countdown card */}
        <div className="bg-linear-to-br from-indigo-500 to-violet-600 rounded-2xl p-5 text-white" style={{ paddingTop: "34px" }}>
          <div className="flex items-center gap-2 mb-6">
            <Calendar size={16} className="text-indigo-200" />
            <p className="text-base font-inter font-semibold text-white">{user?.exam_config?.preparing_for_exam} Exam Countdown</p>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-4xl font-inter text-white font-bold leading-none">{overview?.days_remaining ?? 0}</h2>
              <p className="text-xs text-white/70 font-inter tracking-wide mt-1">days remaining</p>
            </div>
            <div className="w-px h-16 bg-white/20" />
            <div className="flex-1">
              <p className="text-[10px] text-white/65 font-inter">Overall Readiness</p>
              <div className="flex items-center justify-between relative">
                <p className="text-3xl font-inter font-semibold">{overview?.overall_readiness}%</p>
                <span className="text-[10px] text-white/70 font-inter absolute right-0 bottom-0 whitespace-nowrap">Keep it up! 🎯</span>
              </div>
              <Progress.Root className="h-1.5 rounded-full bg-white/20 overflow-hidden mt-2">
                <Progress.Indicator className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${overview?.average_score}%` }} />
              </Progress.Root>
            </div>
          </div>
          <div className="border-t border-white/20 mt-6" />
          <div className="flex gap-10 flex-1 py-3 items-center mt-4">
            <div>
              <p className="text-xs text-white/65 mb-1 font-inter">Exam Date</p>
              <p className="text-sm lg:text-base font-semibold font-inter text-white">05, march 2026</p>
            </div>
            <div>
              <p className="text-xs text-white/65 mb-1 font-inter">Target Score</p>
              <p className="text-sm lg:text-base font-semibold font-inter text-white">{overview?.total_attempts}/{overview?.target_score}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Practice Tests */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] max-md:p-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold font-inter text-[#0F172B] text-base">Recent Practice Test</h2>
          {totalCount > 5 && (
            <button
              onClick={() => setShowAllModal(true)}
              className="text-sm font-inter cursor-pointer text-[#155DFC] hover:text-indigo-800 transition-colors flex items-center gap-1"
            >
              View All ({totalCount})
            </button>
          )}
        </div>

        {isLoading ? (
          <div>{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : recentTests.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-slate-400">No practice tests yet</p>
          </div>
        ) : (
          <div>{recentTests.map(test => <TestCard key={`${test.id}-${test.updated_at}`} test={test} />)}</div>
        )}
      </div>

      {/* ── View All Modal ── */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[85vh]">

            {/* modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-800">All Practice Tests</h2>
                <p className="text-xs text-slate-400 mt-0.5">{totalCount} sessions total</p>
              </div>
              <button
                onClick={() => { setShowAllModal(false); setPage(1); }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* modal body */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
                : allTests.map(test => <TestCard key={`modal-${test.id}-${test.updated_at}`} test={test} />)
              }
            </div>

            {/* pagination footer */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={!hasPrev}
                className="text-xs font-semibold px-4 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← Previous
              </button>
              <span className="text-xs text-slate-400">Page {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!hasNext}
                className="text-xs font-semibold px-4 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardLeft;