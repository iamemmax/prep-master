"use client";

import { ArrowLeft, Clock3, Play, Pause, Sun, Moon, Calculator as CalcIcon } from "lucide-react";
import { SmallSpinner } from "@/components/ui/Spinner";
import IconBtn from "./IconBtn";

export default function SessionTopBar({
  examName,
  focus,
  showTimer,
  timerDisplay,
  timerPct,
  paused,
  isEnding,
  themeMode,
  onBack,
  onTogglePause,
  onToggleCalc,
  onToggleTheme,
  onEnd,
}: {
  examName: string;
  focus: boolean;
  showTimer: boolean;
  timerDisplay: string;
  timerPct: number;
  paused: boolean;
  isEnding: boolean;
  themeMode: "dark" | "light" | string;
  onBack: () => void;
  onTogglePause: () => void;
  onToggleCalc: () => void;
  onToggleTheme: () => void;
  onEnd: () => void;
}) {
  return (
    <header
      data-tour="session-header"
      className={`flex items-center px-4 sm:px-6 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 shrink-0 gap-3 transition-all duration-300 overflow-hidden ${focus ? "h-0 border-b-0 opacity-0" : "h-12 opacity-100"}`}
    >
      <button
        onClick={onBack}
        title="Back to practice"
        aria-label="Back to practice"
        className="inline-flex items-center justify-center w-8 h-8 -ml-1 rounded-md text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-200 transition-colors shrink-0"
      >
        <ArrowLeft size={14} />
      </button>
      <div className="flex items-center min-w-0">
        <span className="inline-flex items-center h-8 px-3 rounded-md bg-[#F7C948] text-[#5A3300] font-black text-sm tracking-tight truncate shadow-sm">
          {(examName || "PRACTICE").toUpperCase()}
        </span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        {showTimer && (
          <span className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-bold font-mono tabular-nums transition-colors ${
            timerPct < 20
              ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10"
              : "text-slate-900 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800"
          }`}>
            <Clock3 size={11} />
            {timerDisplay}
          </span>
        )}
        <IconBtn onClick={onTogglePause} label={paused ? "Resume (Space)" : "Pause (Space)"}>
          {paused ? <Play size={13} fill="currentColor" /> : <Pause size={13} fill="currentColor" />}
        </IconBtn>
        <IconBtn onClick={onToggleCalc} label="Calculator">
          <CalcIcon size={13} />
        </IconBtn>
        <IconBtn onClick={onToggleTheme} label={themeMode === "dark" ? "Light mode" : "Dark mode"}>
          {themeMode === "dark" ? <Sun size={13} /> : <Moon size={13} />}
        </IconBtn>
        <button
          onClick={onEnd}
          className="ml-1 h-8 px-3 rounded-md bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1.5"
        >
          End {isEnding && <SmallSpinner />}
        </button>
      </div>
    </header>
  );
}
