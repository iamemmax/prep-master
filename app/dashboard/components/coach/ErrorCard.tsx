"use client";

import { AlertTriangle, RotateCw } from "lucide-react";

export default function ErrorCard({
  title = "Couldn't generate feedback",
  body,
  onRetry,
  retrying,
}: {
  title?: string;
  body?: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  const message = body
    ?? "The AI coach is unavailable right now. This is usually temporary — please try again in a moment.";

  return (
    <div className="flex flex-col items-center text-center py-10 px-4">
      <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-3">
        <AlertTriangle size={22} className="text-rose-600 dark:text-rose-400" />
      </div>
      <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mb-1">{title}</p>
      <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs leading-relaxed mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={retrying}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 h-9 rounded-md border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
        >
          <RotateCw size={12} className={retrying ? "animate-spin" : ""} />
          Try again
        </button>
      )}
    </div>
  );
}
