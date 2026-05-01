"use client";
import { PlayCircle, Sparkles, ArrowRight } from "lucide-react";
import { Exam } from "../../practice/page";

interface Props {
  /** Kept for caller compatibility — the strip no longer renders session cards. */
  activeExams?: Exam[];
  onBrowse?: () => void;
}

function EmptyBanner({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <section className="relative overflow-hidden rounded-2xl mb-6 border border-[#F7C948]/40 dark:border-amber-500/30 bg-linear-to-br from-[#FFFBEB] via-white to-[#FFF7ED] dark:from-amber-500/10 dark:via-zinc-900 dark:to-orange-500/10">
      {/* Decorative blurs — soft brand-colored depth */}
      <div className="absolute -right-16 -top-20 w-72 h-72 rounded-full bg-[#F7C948]/30 dark:bg-amber-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-24 w-64 h-64 rounded-full bg-[#FE9A00]/20 dark:bg-orange-500/15 blur-3xl pointer-events-none" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #5A3300 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative px-5 sm:px-6 py-4 sm:py-5 flex items-center gap-4">
        {/* Left-side play badge — visible from sm: up; on mobile we stack the
            text only, no badge, to keep the banner short. */}
        <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-xl bg-white/70 dark:bg-amber-500/10 border border-[#F7C948]/40 dark:border-amber-500/30 items-center justify-center shadow-sm">
          <PlayCircle size={22} className="text-[#F7C948] dark:text-amber-300" strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#5A3300] dark:text-amber-200 bg-[#F7C948] dark:bg-amber-500/20 px-2 py-0.5 rounded-full">
              <Sparkles size={10} className="text-[#5A3300] dark:text-amber-200" fill="currentColor" />
              Get started
            </span>
            <h3 className="text-[#0F172B] dark:text-zinc-100 font-bold text-sm sm:text-base leading-tight">
              Ready for your first practice?
            </h3>
          </div>
          <p className="text-slate-600 dark:text-zinc-400 text-[11px] sm:text-xs leading-snug">
            Pick an exam below, choose your pace, and we&apos;ll handle the review.
          </p>
        </div>

        <button
          onClick={onBrowse}
          className="shrink-0 inline-flex items-center gap-1.5 bg-[#F7C948] hover:bg-[#F0BE36] text-[#5A3300] font-bold text-xs px-3 sm:px-4 h-9 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all whitespace-nowrap"
        >
          Browse exams
          <ArrowRight size={13} />
        </button>
      </div>
    </section>
  );
}

export default function ActiveSessionsStrip({ onBrowse }: Props) {
  return <EmptyBanner onBrowse={onBrowse} />;
}
