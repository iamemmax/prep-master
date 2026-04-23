"use client";
import { useRouter } from "next/navigation";
import { Brain, Radar, Timer, ChevronRight, Sparkles } from "lucide-react";

interface FocusItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  detail: string;
  cta: string;
  accent: string;
  bg: string;
  href?: string;
}

const MOCK: FocusItem[] = [
  {
    id: "review",
    icon: <Brain size={16} />,
    title: "Review 7 questions",
    detail: "3 are overdue · memory health at 78%",
    cta: "Start 5-min review",
    accent: "#4E49F6",
    bg: "#EDEDFE",
    href: "/dashboard/progress",
  },
  {
    id: "weakness",
    icon: <Radar size={16} />,
    title: "Fix your weakest topic",
    detail: "Thermodynamics · 32% mastery",
    cta: "Practice 10 questions",
    accent: "#894B00",
    bg: "#FFF4DF",
    href: "/dashboard/progress",
  },
  {
    id: "daily",
    icon: <Timer size={16} />,
    title: "Hit your daily goal",
    detail: "18 of 30 questions done today",
    cta: "Continue",
    accent: "#10B97D",
    bg: "#E2F9F0",
    href: "/dashboard/practice",
  },
];

export default function TodayFocus() {
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#E2E8F0] dark:border-zinc-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-[#FE9A00] to-[#FF6900] flex items-center justify-center">
            <Sparkles size={13} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172B] dark:text-zinc-100 leading-tight">Today&apos;s focus</h3>
            <p className="text-[10px] text-[#99A1B2]">3 high-impact actions picked for you</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {MOCK.map(item => (
          <button
            key={item.id}
            onClick={() => item.href && router.push(item.href)}
            className="group text-left rounded-xl border border-slate-100 dark:border-zinc-800 p-3 hover:border-[#F7C948] hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: item.bg, color: item.accent }}
              >
                {item.icon}
              </div>
              <p className="text-xs font-bold text-[#0F172B] dark:text-zinc-100 truncate">{item.title}</p>
            </div>
            <p className="text-[11px] text-[#45556C] dark:text-zinc-400 leading-snug mb-3">{item.detail}</p>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold" style={{ color: item.accent }}>
                {item.cta}
              </span>
              <ChevronRight size={13} className="text-[#99A1B2] group-hover:translate-x-0.5 transition-transform" style={{ color: item.accent }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
