"use client";
import { isProductionGated } from "@/components/shared/coming-soon-gate";
import { Shuffle, Timer, Sparkles, Radar } from "lucide-react";

interface Action {
  id: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
  accent: string;
  bg: string;
  onClick?: () => void;
}

interface Props {
  onRandom?: () => void;
  onQuickQuiz?: () => void;
  onWeakTopics?: () => void;
  onAIGenerate?: () => void;
}

export default function QuickActions({ onRandom, onQuickQuiz, onWeakTopics, onAIGenerate }: Props) {
  const actions: Action[] = [
    {
      id: "random",
      icon: <Shuffle size={16} />,
      title: "Random mix",
      sub: "10 questions, any topic",
      accent: "#4E49F6",
      bg: "#EDEDFE",
      onClick: onRandom,
    },
    {
      id: "quick",
      icon: <Timer size={16} />,
      title: "5-min quiz",
      sub: "Timed, fast rounds",
      accent: "#10B97D",
      bg: "#E2F9F0",
      onClick: onQuickQuiz,
    },
    {
      id: "weak",
      icon: <Radar size={16} />,
      title: "Fix weak topics",
      sub: "Targets your 3 lowest",
      accent: "#894B00",
      bg: "#FFF4DF",
      onClick: onWeakTopics,
    },
    {
      id: "ai",
      icon: <Sparkles size={16} />,
      title: "AI Generator",
      sub: "Upload a PDF / screenshot",
      accent: "#FF6900",
      bg: "#FFEDD5",
      onClick: onAIGenerate,
    },
  ];

  return (
    <>
  {!isProductionGated()&&  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {actions.map(a => (
        <button
          key={a.id}
          onClick={a.onClick}
          className="group text-left rounded-2xl border border-[#E2E8F0] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-[#F7C948] hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
              style={{ background: a.bg, color: a.accent }}
            >
              {a.icon}
            </div>
            <p className="text-xs font-bold text-[#0F172B] dark:text-white leading-tight">{a.title}</p>
          </div>
          <p className="text-[11px] text-[#45556C] dark:text-white/80 leading-snug">{a.sub}</p>
        </button>
      ))}
    </div>}
    
    </>
  );
}
