"use client";

import { ChevronRight } from "lucide-react";

interface Props {
  name: string;
  description?: string | null;
  badge?: string | null;
  meta?: string;          // e.g. "8 exams" or "4 subjects"
  active?: boolean;
  onClick: () => void;
}

export default function BrowseCard({ name, description, badge, meta, active, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left w-full group rounded-[.875rem] border bg-white dark:bg-zinc-900 p-4 transition-all hover:shadow-md ${
        active
          ? "border-[#F7C948]"
          : "border-[#E2E8F0] dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 leading-snug">{name}</h3>
        {badge && (
          <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFF4DF] text-[#894B00] border border-[#F7C948]/40">
            {badge}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-1.5 text-xs text-[#99A1B2] dark:text-zinc-400 leading-snug line-clamp-3">
          {description}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 dark:text-zinc-400">{meta ?? ""}</span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#894B00] group-hover:translate-x-0.5 transition-transform">
          Open <ChevronRight size={13} />
        </span>
      </div>
    </button>
  );
}
