"use client";


import {

  Flame,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Star,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import DashboardLeft from "./components/dashboard/DashboardLeft";


interface RecommendedCourse {
  name: string;
  tag: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
}

// ─── Data ────────────────────────────────────────────────────────────────────



const recommended: RecommendedCourse[] = [
  { name: "SAT", tag: "Math", level: "Advanced", rating: 4.8 },
  { name: "GMAT", tag: "Quant", level: "Intermediate", rating: 4.6 },
  { name: "GRE", tag: "Verbal", level: "Beginner", rating: 4.7 },
  { name: "CPA", tag: "Finance", level: "Advanced", rating: 4.5 },
  { name: "PMP", tag: "Mgmt", level: "Intermediate", rating: 4.4 },
  { name: "DSAT", tag: "Digital", level: "Beginner", rating: 4.9 },
];

const levelColor: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced: "bg-rose-100 text-rose-700",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${accent}15` }}
      >
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs font-medium mt-0.5" style={{ color: accent }}>{sub}</p>}
      </div>
    </div>
  );
}



// ─── Navbar ───────────────────────────────────────────────────────────────────



// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <main className="max-w-400 mx-auto px-4 sm:px-6 py-8">
        {/* Welcome header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, Sarah! 👋
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              You&apos;re on a 4-day study streak. Keep it up!
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2.5 rounded-xl border border-indigo-200 text-indigo-700 text-sm font-semibold bg-indigo-50 hover:bg-indigo-100 transition-colors">
              View Progress
            </button>
            <button className="px-4 py-2.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold shadow-sm hover:shadow-lg hover:shadow-indigo-200 transition-all">
              Start Practice
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<TrendingUp size={18} />} label="Avg. Practice Score" value="72%" accent="#6366F1" />
          <StatCard icon={<CheckCircle2 size={18} />} label="Questions Answered" value="145" accent="#0EA5E9" />
          <StatCard icon={<Trophy size={18} />} label="Total Sessions" value="12" accent="#F59E0B" />
          <StatCard icon={<Flame size={18} />} label="Easy Streak" value="72%" sub="+3 this week" accent="#EF4444" />
        </div>

        {/* Main 3-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left col: Unlock + Tests */}
        <DashboardLeft/>

          {/* Right col */}
          <div className="flex flex-col gap-6">
            {/* Daily Study Tip */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Target size={14} className="text-indigo-600" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Daily Study Tip</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Focus on eliminating wrong answers first. On SAT multiple choice, 2 options are usually obviously wrong — narrow it down, then decide.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Clock size={12} className="text-slate-400" />
                <span className="text-xs text-slate-400">5 min read</span>
              </div>
            </div>

            {/* Recommended Courses */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900">Recommended</h2>
                <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                  All <ArrowRight size={12} />
                </button>
              </div>

              <div className="space-y-1">
                {recommended.map((course) => (
                  <div
                    key={course.name}
                    className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded-lg px-2 -mx-2 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {course.name.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
                          {course.name}
                        </p>
                        <p className="text-xs text-slate-400">{course.tag}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full",
                          levelColor[course.level]
                        )}
                      >
                        {course.level}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-semibold text-slate-600">{course.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}