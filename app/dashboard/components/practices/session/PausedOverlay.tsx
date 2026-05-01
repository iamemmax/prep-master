"use client";

import { Pause } from "lucide-react";

export default function PausedOverlay({
  paused,
  onResume,
}: {
  paused: boolean;
  onResume: () => void;
}) {
  if (!paused) return null;
  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/70 dark:bg-black/70 backdrop-blur-sm"
      onClick={onResume}
    >
      <div className="flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-xl">
          <Pause size={22} className="text-white" fill="white" />
        </div>
        <p className="text-white font-semibold text-base">Paused</p>
        <p className="text-white/60 text-xs">
          Press <kbd className="bg-white/10 text-white px-1.5 py-0.5 rounded text-[10px] font-mono">Space</kbd> or tap anywhere to resume
        </p>
      </div>
    </div>
  );
}
