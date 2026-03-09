"use client";


import {
  Flame,
  Trophy,
} from "lucide-react";
// import { cn } from "@/lib/utils";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import DashboardLeft from "./components/dashboard/DashboardLeft";
import PrepLogo from "@/utils/icons/logos/PrepLogo";
import RibbonIcon from "@/utils/icons/RibbonIcon";


interface RecommendedExam {
  name: string;
  questions: number;
  freeCount: number;
  emoji: string;
}

const recommendedExams: RecommendedExam[] = [
  { name: "GRE",  questions: 3200, freeCount: 50, emoji: "🎓" },
  { name: "SAT",  questions: 2500, freeCount: 50, emoji: "📚" },
  { name: "GMAT", questions: 2800, freeCount: 40, emoji: "💼" },
  { name: "CIPM", questions: 3200, freeCount: 50, emoji: "🎓" },
  { name: "CIS",  questions: 2500, freeCount: 50, emoji: "📚" },
  { name: "PMP 2",questions: 3200, freeCount: 50, emoji: "🎓" },
  { name: "CIBN", questions: 2500, freeCount: 50, emoji: "📚" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const STATS = [
  { icon: <Trophy size={28} />,  value: "72%", label: "Your Average Score",   accent: "#F59E0B" },
  { icon: <PrepLogo color="#2B7FFF" />,  value: "145", label: "Questions Answered",   accent: "#0EA5E9" },
  { icon: <RibbonIcon />,  value: "12",  label: "Total Attempts",       accent: "#A855F7" },
  { icon: <Flame  size={28} />,  value: "72%", label: "Day Streak",           accent: "#FF6900" },
];

const DAILY_TIP = "Practice in timed mode to simulate real exam conditions. This helps build speed and confidence!";

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-[14px] px-4 py-4.5 flex items-center gap-3  border-[1.2px] border-[#E2E8F0] hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
      <span style={{ color: accent }} className="shrink-0">{icon}</span>
          <div className="">

        <p className="text-xl font-bold text-slate-800 leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>

        </div>
    </div>
  );
}

function DailyTipCard({ tip }: { tip: string }) {
  return (
    <div className="bg-linear-to-r max-sm:col-span-2 from-[#EFF6FF] to-[#EEF2FF] border border-[#BEDBFF] rounded-[14px]  px-4 py-4.5 flex items-start gap-3 shadow-sm min-w-45">
      <div className="w-7 h-7 rounded-lg bg-[#2B5080] flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-white text-xs">💡</span>
      </div>
      <div>
        <p className="text-sm font-semibold font-inter text-[#0F172B] leading-tight mb-1">Daily Study Tip</p>
        <p className="text-[10px] text-[#314158] font-inter">{tip}</p>
      </div>
    </div>
  );
}


// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader />

      <main className="max-w-400 mx-auto max-md:px-4  py-8">
        {/* Welcome header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="sm:text-2xl text-lg lg:text-[1.875rem] font-semibold font-inter text-[#0F172B]">
              Welcome back, Sarah! 👋
            </h1>
            <p className="text-sm lg:text-base text-[#45556C] font-inter ">
              You&apos;re on a 4-day study streak. Keep it up!
            </p>
          </div>
          <div className="flex gap-3">
            <button  className="px-4 lg:px-6 py-2.5 rounded-[.625rem] border border-[#BEDBFF] font-inter bg-[#EFF6FF] text-sm  font-semibold text-[#4E49F6] hover:scale-95 cursor-pointer transition-colors">
              View Progress
            </button>
            <button className="px-4 lg:px-6 py-2.5 rounded-[.625rem] bg-[#4E49F6] text-white font-inter text-sm  font-bold  hover:scale-95 hover:shadow-indigo-200 cursor-pointer transition-all">
              Start Practice
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {STATS.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
      <DailyTipCard tip={DAILY_TIP} />
    </div>
        {/* Main 3-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left col: Unlock + Tests */}
        <DashboardLeft/>

          {/* Right col */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <h2 className="font-semibold font-inter text-[#0F172B] text-sm">Recommended Exams</h2>
    <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
      Browse All
    </button>
  </div>

  {/* List */}
  <div className="space-y-0">
    {recommendedExams.map((exam) => (
      <div
        key={exam.name}
        className="flex items-center justify-between py-3 border-b border-[#E2E8F0] last:border-0 cursor-pointer hover:bg-slate-50  px-1 -mx-1 transition-colors"
      >
        {/* Left: icon + text */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0">
            {exam.emoji}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0F172B] font-inter">{exam.name}</p>
            <p className="text-[.6875rem] text-[#6B7485] font-inter">{exam.questions.toLocaleString()} questions</p>
            <p className="text-[.6875rem] text-[#6B7485] font-inter">Premium for full access</p>
          </div>
        </div>

        {/* Right: free pill */}
        <span className="text-xs font-bold px-3 py-1.5 font-inter text-[10px] rounded-[.6875rem] bg-[#E2F9F0] text-[#10B97D] shrink-0 whitespace-nowrap">
          {exam.freeCount} free
        </span>
      </div>
    ))}
  </div>

  {/* Footer link */}
  <button className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
    Browse All Exams →
  </button>
</div>
        </div>
      </main>
    </div>
  );
}