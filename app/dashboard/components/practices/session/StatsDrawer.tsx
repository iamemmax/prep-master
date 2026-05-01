"use client";

import { BarChart3, X as XIcon } from "lucide-react";
import PracticeRightPanel, { RightPanelProps } from "../PracticeRightPannel";

export default function StatsDrawer({
  open,
  onClose,
  panelProps,
}: {
  open: boolean;
  onClose: () => void;
  panelProps: RightPanelProps;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/40 backdrop-blur-[2px]" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-80 max-w-[85vw] bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-zinc-800"
      >
        <div className="flex items-center justify-between px-4 h-12 border-b border-slate-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-slate-500 dark:text-zinc-400" />
            <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Session stats</p>
          </div>
          <button onClick={onClose} className="text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 p-1 rounded">
            <XIcon size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <PracticeRightPanel {...panelProps} />
        </div>
      </div>
    </div>
  );
}
