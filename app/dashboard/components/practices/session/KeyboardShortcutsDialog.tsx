"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

const SHORTCUTS: ReadonlyArray<readonly [string, string]> = [
  ["A – D",  "Select answer"],
  ["1 – 9",  "Select answer"],
  ["→",      "Next question"],
  ["←",      "Previous"],
  ["F",      "Flag question"],
  ["Space",  "Pause / resume"],
  ["Z",      "Focus mode"],
  ["?",      "Show this panel"],
  ["Esc",    "Close overlays"],
];

export default function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 gap-3">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-zinc-100">
            <Keyboard size={15} className="text-slate-500 dark:text-zinc-400" />
            Keyboard shortcuts
          </DialogTitle>
          <DialogDescription className="sr-only">Keyboard shortcuts reference for this practice session.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          {SHORTCUTS.map(([keys, label]) => (
            <div key={keys} className="flex items-center justify-between gap-2 py-1">
              <span className="text-slate-500 dark:text-zinc-400">{label}</span>
              <kbd className="inline-flex items-center justify-center min-w-10 px-1.5 h-5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-[10px] font-bold border border-slate-200 dark:border-zinc-700">
                {keys}
              </kbd>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 dark:text-zinc-500 italic mt-1">
          Tip: hover any option and click × to eliminate it.
        </p>
      </DialogContent>
    </Dialog>
  );
}
