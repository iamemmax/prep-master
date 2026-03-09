import React from 'react'
import { Star, Calendar, ArrowRight, Clock, LayoutGrid } from 'lucide-react';
import * as Progress from "@radix-ui/react-progress";
import Unlockicon from '@/utils/icons/UnlockIcon';
import { getScoreAccent } from '@/utils/color/getPercentageColor';
import PrepLogo from '@/utils/icons/logos/PrepLogo';

interface RecentTest {
  name: string;
  date: string;
  duration: string;
  tags: string[];
  score: number;
  total: number;
}
const recentTests: RecentTest[] = [
  { name: "SAT Practice Test", date: "Feb 17, 2025", duration: "30m", tags: ["Math (Calc)", "Reading"], score: 85, total: 20 },
  { name: "SAT Math Focus", date: "Feb 15, 2025", duration: "20m", tags: ["Math (Calc)"], score: 70, total: 15 },
  { name: "GRE Verbal Practice", date: "Feb 12, 2025", duration: "25m", tags: ["Verbal"], score: 78, total: 20 },
];

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

const DashboardLeft = () => {
  return (
    <div className="lg:col-span-2 flex flex-col gap-6">

      {/* Cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Unlock Your Full Potential */}
        <div
          className="relative border border-[#FEE685] rounded-2xl p-8 overflow-hidden"
          style={{ background: "linear-gradient(to right, #FFFBEB, #FFF7ED)", border: "1px solid #FEE685" }}
        >
          {/* Decorative faded illustration */}
          <div className="absolute right-0 h-full w-full bottom-0 opacity-80 pointer-events-none select-none flex items-end justify-end pr-2 pb-2">
            {/* <BookOpen size={96} className="text-amber-400" /> */}
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
            {[
              "Unlimited practice attempts",
              "Access to all premium questions",
              "Detailed performance analytics",
              "Custom study plans",
            ].map((f) => (
              <li key={f} className="flex items-center font-inter gap-3 text-xs text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <button className="px-5 py-2 rounded-[.5275rem] bg-linear-to-r from-[#FE9A00] to-[#FF6900] text-white text-xs font-bold hover:shadow-md transition-shadow">
            Upgrade Now
          </button>
        </div>

        {/* SAT Exam Countdown */}
        <div className="bg-linear-to-br from-indigo-500 to-violet-600 rounded-2xl p-5 text-white"

          style={{ paddingTop: "34px" }}>
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Calendar size={16} className="text-indigo-200" />
            <p className="text-base font-inter font-semibold text-white">SAT Exam Countdown</p>
          </div>

          {/* Main section */}
          <div className="flex items-center gap-6">

            {/* Left - Days */}
            <div>
              <h2 className="text-4xl font-inter text-white font-bold leading-none">21</h2>
              <p className="text-xs text-white/70 font-inter  tracking-wide mt-1">
                days remaining
              </p>
            </div>

            {/* Divider */}
            <div className="w-1 h-16 bg-white/20" style={{ width: "1px" }}></div>

            {/* Readiness */}
            <div className="flex-1">
              <p className="text-xs text-white/65 font-inter" style={{ fontSize: "10px" }}>Overall Readiness</p>
              <div className="flex items-center justify-between relative">
                <p className="text-3xl font-inter font-semibold">68%</p>
                <span className=" text-xs text-white/70 font-inter absolute right-0 bottom-0 whitespace-nowrap" style={{ fontSize: "10px" }}>
                  Keep it up! 🎯
                </span>
              </div>
              <Progress.Root className="h-1.5 rounded-full bg-white/20 overflow-hidden mt-2">
                <Progress.Indicator
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{ width: "68%" }}
                />
              </Progress.Root>
            </div>
          </div>

          {/* Divider line */}
          <div className="border-t border-white/20 mt-6"></div>

          {/* Bottom section */}
          <div className="flex gap-10  flex-1 py-3 items-center mt-4">
            <div>
              <p className="text-xs text-white/65 mb-1 font-inter">Exam Date</p>
              <p className="text-sm lg:text-base font-semibold font-inter text-white">March 13, 2025</p>
            </div>
            <div>
              <p className="text-xs text-white/65 mb-1 font-inter">Target Score</p>
              <p className="text-sm lg:text-base font-semibold font-inter text-white">1400 / 1600</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Practice Tests */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] max-md:p-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold font-inter text-[#0F172B] text-base">Recent Practice Test</h2>
          <button className="text-sm font-inter cursor-pointer text-[#155DFC] hover:text-indigo-800 transition-colors flex items-center gap-1">
            View All 
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentTests.map((test) => (
            <div
              key={`${test.name}-${test.date}`}
              className=" cursor-pointer group rounded-2xl border mb-3 border-[#E2E8F0] hover:scale-95 transition-all p-5"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: name, date, meta */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm lg:text-base font-medium text-[#0F172B] truncate  transition-colors">
                    {test.name}
                  </p>
                  <p className="text-xs text-[#45556C] mt-0.5 mb-2">{test.date}</p>
                  <div className="flex items-center font-inter gap-3">
                    <span className="flex items-center gap-1 text-xs xl:text-sm text-[#45556C]">
                      <Clock size={18} />
                      {test.duration}
                    </span>
                    <span className="flex items-center gap-1 text-xs xl:text-sm text-[#45556C]">
                      <PrepLogo color='#45556C' width={18} height={18}  />
                      {test.tags.join(", ")}
                    </span>
                  </div>
                </div>

                {/* Right: score */}
                <div className="text-right shrink-0">

                  <p className="text-2xl font-bold text-[#0F172B] font-inter leading-none" >
                    {test.score}%
                  </p>

                </div>
              </div>

              {/* Full-width progress bar */}
              <ScoreBar score={test.score} />

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default DashboardLeft;