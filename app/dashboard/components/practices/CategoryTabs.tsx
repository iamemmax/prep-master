"use client";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryTabsProps {
  categories: string[];
  selected: string;
  counts?: Record<string, number>;
  onSelect: (c: string) => void;
}

export default function CategoryTabs({ categories, selected, counts, onSelect }: CategoryTabsProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const scroll = (dir: 1 | -1) => {
    const el = ref.current; if (!el) return;
    el.scrollBy({ left: dir * 240, behavior: "smooth" });
  };

  return (
    <div className="relative flex items-center gap-1 mb-4">
      <button
        onClick={() => scroll(-1)}
        className="hidden sm:flex w-7 h-7 rounded-full border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 items-center justify-center shrink-0"
        aria-label="Scroll categories left"
      >
        <ChevronLeft size={14} />
      </button>

      <div ref={ref} className="flex-1 overflow-x-auto scrollbar-thin" style={{ scrollbarWidth: "none" }}>
        <div className="flex gap-1.5 min-w-max">
          {categories.map(c => {
            const isActive = c === selected;
            const count = counts?.[c];
            return (
              <button
                key={c}
                onClick={() => onSelect(c)}
                className={`text-xs font-semibold px-3.5 py-2 rounded-full border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#0F172B] dark:bg-zinc-100 text-white dark:text-zinc-900 border-[#0F172B] dark:border-zinc-100"
                    : "bg-white dark:bg-zinc-900 text-[#45556C] dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 hover:bg-slate-50 dark:hover:bg-zinc-800"
                }`}
              >
                {c}
                {count != null && (
                  <span className={`text-[10px] font-bold tabular-nums ${isActive ? "text-white/60 dark:text-zinc-900/60" : "text-[#99A1B2] dark:text-zinc-500"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => scroll(1)}
        className="hidden sm:flex w-7 h-7 rounded-full border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 items-center justify-center shrink-0"
        aria-label="Scroll categories right"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
