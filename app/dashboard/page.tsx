"use client";

import { useState } from "react";
import { Flame, Trophy, X, BookOpen, HelpCircle, Crown, ChevronRight, Sparkles } from "lucide-react";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import DashboardLeft from "./components/dashboard/DashboardLeft";
import TodayFocus from "./components/dashboard/TodayFocus";
import WeeklyActivity from "./components/dashboard/WeeklyActivity";
import MilestoneCard from "./components/dashboard/MilestoneCard";
import PeerPercentile from "./components/dashboard/PeerPercentile";
import PrepLogo from "@/utils/icons/logos/PrepLogo";
import RibbonIcon from "@/utils/icons/RibbonIcon";
import { useGetDashboardOverview } from "./util/apis/dashboard/fetchDashboardOverview";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import CoachDashboardWidget from "./components/coach/CoachDashboardWidget";
import { DashboardInsightRequest } from "./util/ai/types";

// Deterministic accent color based on the exam name so each badge stays the
// same color across renders — avoids Math.random reshuffling on every render.
const EXAM_COLORS = [
  { bg: "#F7C948", fg: "#5A3300" },
  { bg: "#2B7FFF", fg: "#FFFFFF" },
  { bg: "#10B97D", fg: "#FFFFFF" },
  { bg: "#A855F7", fg: "#FFFFFF" },
  { bg: "#FF6900", fg: "#FFFFFF" },
  { bg: "#EC4899", fg: "#FFFFFF" },
] as const;
function examAccent(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return EXAM_COLORS[Math.abs(h) % EXAM_COLORS.length];
}

type RecommendedExam = {
  id: number;
  reference: string;
  name: string;
  description?: string;
  is_premium: boolean;
  total_questions?: number;
  total_topics?: number;
  difficulty_level?: string;
  subjects?: { id: number; name: string }[];
};

const DAILY_TIP = "Practice in timed mode to simulate real exam conditions. This helps build speed and confidence!";

function StatCard({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: string; accent: string;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[14px] px-4 py-4 flex items-center gap-3 border-[1.2px] border-[#E2E8F0] dark:border-zinc-800 hover:shadow-md transition-shadow">
      <span style={{ color: accent }} className="shrink-0">{icon}</span>
      <div>
        <p className="text-xl font-bold text-slate-800 dark:text-zinc-100 leading-none">{value}</p>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

function DailyTipCard({ tip }: { tip: string }) {
  return (
    <div className="bg-linear-to-r max-sm:col-span-2 from-[#EFF6FF] to-[#EEF2FF] dark:from-blue-900/40 dark:to-indigo-900/40 border border-[#BEDBFF] dark:border-blue-900 rounded-[14px] px-4 py-4 flex items-start gap-3 shadow-sm">
      <div className="w-7 h-7 rounded-lg bg-[#2B5080] flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-white text-xs">💡</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-[#0F172B] dark:text-zinc-100 leading-tight mb-1">Daily Study Tip</p>
        <p className="text-[10px] text-[#314158] dark:text-zinc-400">{tip}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: response } = useGetDashboardOverview();
  const overview = response?.data?.overview;
  const recommendedExams: RecommendedExam[] = response?.data?.recommended_exams?.data ?? [];
  const recommendedCount = response?.data?.recommended_exams?.count ?? recommendedExams.length;
  const dailyTip = response?.data?.daily_tip ?? DAILY_TIP;
  const [showAllExams, setShowAllExams] = useState(false);

  // Build the dashboard-glance coach request from the overview snapshot.
  // Fields the backend doesn't yet surface (improvement delta, recentMistakes
  // count) fall back to reasonable defaults — the coach endpoint will compute
  // real values once available.
  const coachRequest: DashboardInsightRequest | null = overview ? {
    accuracy: overview.average_score ?? 0,
    avgTime: 60,
    weakTopics: [],
    recentMistakes: 0,
    improvement: 0,
  } : null;

  const STATS = [
    {
      icon: <Trophy size={28} />,
      value: overview?.average_score != null ? `${overview.average_score}%` : "—",
      label: "Your Average Score",
      accent: "#F59E0B",
    },
    {
      icon: <PrepLogo color="#2B7FFF" />,
      value: overview?.questions_answered?.toString() ?? "—",
      label: "Questions Answered",
      accent: "#0EA5E9",
    },
    {
      icon: <RibbonIcon />,
      value: overview?.total_attempts?.toString() ?? "—",
      label: "Total Attempts",
      accent: "#A855F7",
    },
    {
      icon: <Flame size={28} />,
      value: overview?.day_streak?.toString() ?? "—",
      label: "Day Streak",
      accent: "#FF6900",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      <DashboardHeader />

      <main className="max-w-400 mx-auto max-2xl:px-6 py-8">
        {/* Welcome header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="sm:text-2xl text-lg lg:text-[1.875rem] font-semibold text-[#0F172B] dark:text-zinc-100">
              Welcome back! 👋
            </h1>
            <p className="text-sm lg:text-base text-[#45556C] dark:text-zinc-400">
              {overview?.day_streak
                ? `You're on a ${overview.day_streak}-day study streak. Keep it up!`
                : "Start practicing to build your streak!"}
            </p>
          </div>
          <div className="flex gap-3">
            {/* <button className="px-4 lg:px-6 py-2.5 rounded-[.625rem] border border-[#BEDBFF] dark:border-blue-900 bg-[#EFF6FF] text-sm font-semibold text-[#4E49F6] hover:scale-95 cursor-pointer transition-colors">
              View Progress
            </button>
            <button className="px-4 lg:px-6 py-2.5 rounded-[.625rem] bg-[#4E49F6] text-white text-sm font-bold hover:scale-95 cursor-pointer transition-all">
              Start Practice
            </button> */}
          </div>
        </div>

        {/* Stats row */}
        <div data-tour="dashboard-stats" className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {STATS.map(s => (
            <StatCard key={s.label} {...s} />
          ))}
          <DailyTipCard tip={dailyTip} />
        </div>

        {/* Today's focus */}
        <div className="mb-6">
          <TodayFocus />
        </div>

        {/* AI coach at-a-glance */}
        <div data-tour="dashboard-coach" className="mb-6">
          <CoachDashboardWidget request={coachRequest} />
        </div>

        {/* Insight row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <WeeklyActivity />
          <MilestoneCard />
          <PeerPercentile />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DashboardLeft overview={response?.data?.overview} />

          {/* Recommended Exams */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="inline-flex items-center gap-1.5 text-base font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                  <Sparkles size={14} className="text-[#F7C948]" />
                  Recommended
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Tailored to your prep target</p>
              </div>
              {recommendedExams.length > 0 && (
                <button
                  onClick={() => setShowAllExams(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 h-8 rounded-md border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  View all
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 tabular-nums">
                    {recommendedCount}
                  </span>
                </button>
              )}
            </div>

            <div className="space-y-2 flex-1">
              {recommendedExams.length === 0 ? (
                <div className="text-center py-10 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                  <BookOpen size={20} className="text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 dark:text-zinc-500 italic">No recommendations yet</p>
                </div>
              ) : (
                recommendedExams.slice(0, 5).map(exam => (
                  <RecommendedRow key={exam.reference} exam={exam} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── View all exams modal ── */}
      <Dialog open={showAllExams} onOpenChange={v => { if (!v) setShowAllExams(false); }}>
        <DialogContent
          showCloseButton={false}
          className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-0 gap-0 text-slate-900 dark:text-zinc-100 rounded-2xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl"
          style={{ maxWidth: 840 }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-zinc-100 tracking-tight inline-flex items-center gap-2">
                <Sparkles size={16} className="text-[#F7C948]" />
                All recommended exams
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                {recommendedCount} exam{recommendedCount === 1 ? "" : "s"} available
              </DialogDescription>
            </div>
            <button
              onClick={() => setShowAllExams(false)}
              className="text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-6 py-4 bg-slate-50/50 dark:bg-zinc-950/50 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendedExams.length === 0 ? (
              <p className="col-span-full text-center text-sm text-slate-400 dark:text-zinc-500 italic py-10">
                No exams available yet.
              </p>
            ) : (
              recommendedExams.map(exam => <ExamCard key={exam.reference} exam={exam} />)
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RecommendedRow({ exam }: { exam: RecommendedExam }) {
  const accent = examAccent(exam.name);
  return (
    <button
      className="w-full flex items-center gap-3 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/50 px-2 py-2.5 transition-all text-left focus:outline-none focus:ring-2 focus:ring-[#F7C948]/40"
    >
      <span
        className="inline-flex items-center justify-center w-10 h-10 rounded-lg font-black text-xs shadow-sm shrink-0"
        style={{ background: accent.bg, color: accent.fg }}
      >
        {exam.name.slice(0, 4).toUpperCase()}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">{exam.name}</p>
          {exam.is_premium && <Crown size={11} className="text-amber-500 shrink-0" fill="currentColor" />}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 flex-wrap">
          {exam.total_questions != null && (
            <span className="inline-flex items-center gap-1 tabular-nums"><HelpCircle size={10} />{exam.total_questions.toLocaleString()}</span>
          )}
          {exam.total_topics != null && (
            <span className="inline-flex items-center gap-1 tabular-nums"><BookOpen size={10} />{exam.total_topics} topic{exam.total_topics === 1 ? "" : "s"}</span>
          )}
          {exam.difficulty_level && <span className="capitalize">· {exam.difficulty_level}</span>}
        </div>
      </div>
      <ChevronRight size={16} className="text-slate-300 dark:text-zinc-600 shrink-0" />
    </button>
  );
}

function ExamCard({ exam }: { exam: RecommendedExam }) {
  const accent = examAccent(exam.name);
  return (
    <button className="text-left p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#F7C948]/40">
      <div className="flex items-start justify-between gap-2 mb-3">
        <span
          className="inline-flex items-center justify-center h-9 px-3 rounded-md font-black text-sm shadow-sm"
          style={{ background: accent.bg, color: accent.fg }}
        >
          {exam.name.toUpperCase()}
        </span>
        {exam.is_premium ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <Crown size={10} fill="currentColor" /> Premium
          </span>
        ) : (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
            Free
          </span>
        )}
      </div>
      {exam.description && (
        <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
          {exam.description}
        </p>
      )}
      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400 flex-wrap">
        {exam.total_questions != null && (
          <span className="inline-flex items-center gap-1 tabular-nums">
            <HelpCircle size={11} />{exam.total_questions.toLocaleString()} questions
          </span>
        )}
        {exam.total_topics != null && (
          <span className="inline-flex items-center gap-1 tabular-nums">
            <BookOpen size={11} />{exam.total_topics} topic{exam.total_topics === 1 ? "" : "s"}
          </span>
        )}
        {exam.difficulty_level && <span className="capitalize">· {exam.difficulty_level}</span>}
      </div>
    </button>
  );
}