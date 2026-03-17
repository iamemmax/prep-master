"use client";

import { Flame, Trophy } from "lucide-react";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import DashboardLeft from "./components/dashboard/DashboardLeft";
import PrepLogo from "@/utils/icons/logos/PrepLogo";
import RibbonIcon from "@/utils/icons/RibbonIcon";
import { useGetDashboardOverview } from "./util/apis/dashboard/fetchDashboardOverview";

const DAILY_TIP = "Practice in timed mode to simulate real exam conditions. This helps build speed and confidence!";

function StatCard({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: string; accent: string;
}) {
  return (
    <div className="bg-white rounded-[14px] px-4 py-4 flex items-center gap-3 border-[1.2px] border-[#E2E8F0] hover:shadow-md transition-shadow">
      <span style={{ color: accent }} className="shrink-0">{icon}</span>
      <div>
        <p className="text-xl font-bold text-slate-800 leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

function DailyTipCard({ tip }: { tip: string }) {
  return (
    <div className="bg-linear-to-r max-sm:col-span-2 from-[#EFF6FF] to-[#EEF2FF] border border-[#BEDBFF] rounded-[14px] px-4 py-4 flex items-start gap-3 shadow-sm">
      <div className="w-7 h-7 rounded-lg bg-[#2B5080] flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-white text-xs">💡</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-[#0F172B] leading-tight mb-1">Daily Study Tip</p>
        <p className="text-[10px] text-[#314158]">{tip}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: response } = useGetDashboardOverview();
  const overview = response?.data?.overview;
  // const recommendedExams = response?.data?.recommended_exams ?? [];
  const recommendedExams = Array.isArray(response?.data?.recommended_exams)
  ? response.data.recommended_exams
  : [];
  const dailyTip = response?.data?.daily_tip ?? DAILY_TIP;

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
    <div className="min-h-screen bg-white">
      <DashboardHeader />

      <main className="max-w-400 mx-auto max-2xl:px-6 py-8">
        {/* Welcome header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="sm:text-2xl text-lg lg:text-[1.875rem] font-semibold text-[#0F172B]">
              Welcome back! 👋
            </h1>
            <p className="text-sm lg:text-base text-[#45556C]">
              {overview?.day_streak
                ? `You're on a ${overview.day_streak}-day study streak. Keep it up!`
                : "Start practicing to build your streak!"}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 lg:px-6 py-2.5 rounded-[.625rem] border border-[#BEDBFF] bg-[#EFF6FF] text-sm font-semibold text-[#4E49F6] hover:scale-95 cursor-pointer transition-colors">
              View Progress
            </button>
            <button className="px-4 lg:px-6 py-2.5 rounded-[.625rem] bg-[#4E49F6] text-white text-sm font-bold hover:scale-95 cursor-pointer transition-all">
              Start Practice
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {STATS.map(s => (
            <StatCard key={s.label} {...s} />
          ))}
          <DailyTipCard tip={dailyTip} />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DashboardLeft overview={response?.data?.overview} />

          {/* Recommended Exams */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#0F172B] text-sm">Recommended Exams</h2>
              <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Browse All</button>
            </div>

            <div className="space-y-0">
              {recommendedExams.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No recommendations yet</p>
              ) : (
                recommendedExams?.map((exam) => (
                  <div key={exam.reference}
                    className="flex items-center justify-between py-3 border-b border-[#E2E8F0] last:border-0 cursor-pointer hover:bg-slate-50 px-1 -mx-1 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0">
                        📚
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0F172B]">{exam.name}</p>
                        <p className="text-[.6875rem] text-[#6B7485]">{exam.total_questions?.toLocaleString()} questions</p>
                        <p className="text-[.6875rem] text-[#6B7485]">
                          {exam.is_premium ? "Premium for full access" : "Free access"}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-[.6875rem] shrink-0 whitespace-nowrap ${
                      exam.is_premium
                        ? "bg-amber-50 text-amber-600"
                        : "bg-[#E2F9F0] text-[#10B97D]"
                    }`}>
                      {exam.is_premium ? "Premium" : "Free"}
                    </span>
                  </div>
                ))
              )}
            </div>

            <button className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              Browse All Exams →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}