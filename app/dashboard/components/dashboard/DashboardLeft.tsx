import React, { useState } from 'react'
import { cn } from '@/lib/utils';
import { Star, CheckCircle2, Calendar, ArrowRight, BookOpen } from 'lucide-react';
import * as Progress from "@radix-ui/react-progress";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RecentTest {
  name: string;
  date: string;
  tags: string[];
  score: number;
  accent: string;
}


function ScoreBar({ score, accent }: { score: number; accent: string }) {
  return (
    <Progress.Root
      className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden"
      value={score}
    >
      <Progress.Indicator
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${score}%`, background: accent }}
      />
    </Progress.Root>
  );
}

const recentTests: RecentTest[] = [
  {
    name: "SAT Practice Test",
    date: "Feb 11, 2025",
    tags: ["Math", "Calc", "Reading"],
    score: 85,
    accent: "#6366F1",
  },
  {
    name: "SAT Practice Test",
    date: "Feb 05, 2025",
    tags: ["Math", "Vocab"],
    score: 70,
    accent: "#8B5CF6",
  },
  {
    name: "GRE Verbal Practice",
    date: "Jan 28, 2025",
    tags: ["Verbal"],
    score: 62,
    accent: "#0EA5E9",
  },
];
const DashboardLeft = () => {
  const [activeTab, setActiveTab] = useState<"all" | "recent">("all");

  return (
      <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Cards row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Unlock potential */}
              <div className="bg-linear-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center">
                    <Star size={14} className="text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">Unlock Your Full Potential</h3>
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Personalized study plans, advanced analytics, and unlimited practice tests.
                </p>
                <ul className="space-y-1.5 mb-4">
                  {["Adaptive learning paths", "Score prediction", "Detailed analytics", "Priority support"].map(
                    (f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 size={12} className="text-amber-500 shrink-0" />
                        {f}
                      </li>
                    )
                  )}
                </ul>
                <button className="w-full py-2.5 rounded-xl bg-linear-to-r from-amber-400 to-orange-500 text-white text-xs font-bold hover:shadow-md transition-shadow">
                  Upgrade to Pro
                </button>
              </div>

              {/* SAT Countdown */}
              <div className="bg-linear-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={15} className="text-indigo-200" />
                  <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wide">
                    SAT Exam Countdown
                  </p>
                </div>
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-5xl font-black leading-none">21</p>
                    <p className="text-indigo-300 text-xs mt-1">days remaining</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-amber-300">68%</p>
                    <p className="text-indigo-300 text-xs mt-1">prepared</p>
                  </div>
                </div>
                <Progress.Root className="h-2 rounded-full bg-indigo-800/60 overflow-hidden mb-3" value={68}>
                  <Progress.Indicator
                    className="h-full rounded-full bg-linear-to-r from-amber-300 to-amber-400 transition-all duration-700"
                    style={{ width: "68%" }}
                  />
                </Progress.Root>
                <div className="flex justify-between text-xs text-indigo-300">
                  <span>Exam: March 13, 2025</span>
                  <span>1406 / 1600</span>
                </div>
              </div>
            </div>

            {/* Recent Practice Tests */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-slate-900">Recent Practice Tests</h2>
                <button className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                  See all <ArrowRight size={12} />
                </button>
              </div>

              <div className="flex gap-2 mb-5">
                {(["all", "recent"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors",
                      activeTab === t
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {recentTests.map((test) => (
                  <div
                    key={`${test.name}-${test.date}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div
                      className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center"
                      style={{ background: `${test.accent}15` }}
                    >
                      <BookOpen size={16} style={{ color: test.accent }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">{test.name}</p>
                        <span className="text-sm font-bold ml-3" style={{ color: test.accent }}>
                          {test.score}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs text-slate-400">{test.date}</p>
                        <div className="flex gap-1">
                          {test.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: `${test.accent}15`, color: test.accent }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ScoreBar score={test.score} accent={test.accent} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
  )
}

export default DashboardLeft