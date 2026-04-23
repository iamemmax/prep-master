"use client";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, PlayCircle, Clock } from "lucide-react";
import { Exam } from "../../practice/page";

interface Props {
  activeExams: Exam[];
  onBrowse?: () => void;
}

function SessionCard({ exam }: { exam: Exam }) {
  const router = useRouter();
  const progress = exam.progress ?? 0;
  const remaining = Math.max(0, exam.questions - Math.round((progress / 100) * exam.questions));

  return (
    <div
      onClick={() => exam.sessionId && router.push(`/dashboard/practice/start-practice/${exam.sessionId}`)}
      className="relative snap-start shrink-0 w-[86%] sm:w-[440px] overflow-hidden rounded-2xl cursor-pointer group"
      style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 60%, #A78BFA 100%)" }}
    >
      <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="relative flex flex-col justify-between gap-3 p-5 h-full min-h-[152px]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 bg-white/15 px-2 py-0.5 rounded-full">
              In Progress
            </span>
            {exam.lastScore != null && (
              <span className="text-[10px] font-semibold text-white/80">
                Last score <span className="font-bold text-white">{exam.lastScore}%</span>
              </span>
            )}
          </div>
          <p className="text-white font-bold text-lg leading-tight line-clamp-1">{exam.name}</p>
          <p className="text-purple-100/90 text-[11px] mt-0.5">
            <Clock size={10} className="inline -mt-0.5 mr-0.5" />
            {remaining.toLocaleString()} questions remaining · {progress}% done
          </p>
        </div>

        <div>
          <div className="h-1.5 rounded-full bg-white/25 overflow-hidden mb-3">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              exam.sessionId && router.push(`/dashboard/practice/start-practice/${exam.sessionId}`);
            }}
            className="inline-flex items-center gap-1.5 bg-white text-indigo-700 font-bold text-xs px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all group-hover:-translate-y-0.5"
          >
            <PlayCircle size={13} />
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyCta({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <div
      onClick={onBrowse}
      className="shrink-0 w-full sm:w-[440px] overflow-hidden rounded-2xl cursor-pointer bg-linear-to-br from-[#FFF4DF] to-[#FDE68A] border border-[#F7C948]/30 p-5 min-h-[152px] flex items-center justify-between gap-4"
    >
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#894B00] bg-white/50 inline-block px-2 py-0.5 rounded-full mb-1.5">
          Get started
        </p>
        <p className="text-[#0F172B] font-bold text-base leading-tight">No sessions in progress</p>
        <p className="text-[#894B00] text-[11px] mt-1">Pick an exam below and start your first practice.</p>
      </div>
      <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shrink-0">
        <PlayCircle size={18} className="text-[#894B00]" />
      </div>
    </div>
  );
}

export default function ActiveSessionsStrip({ activeExams, onBrowse }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scroll = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const hasMany = activeExams.length > 1;

  return (
    <div className="mb-6">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-[#0F172B] dark:text-zinc-100 leading-tight">Continue where you left off</h2>
          <p className="text-[11px] text-[#99A1B2] dark:text-zinc-400">
            {activeExams.length > 0
              ? `${activeExams.length} session${activeExams.length === 1 ? "" : "s"} in progress`
              : "Start an exam to see it here"}
          </p>
        </div>
        {hasMany && (
          <div className="flex gap-1.5">
            <button
              onClick={() => scroll(-1)}
              className="w-7 h-7 rounded-full border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center"
              aria-label="Scroll left"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-7 h-7 rounded-full border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center"
              aria-label="Scroll right"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 scrollbar-thin"
        style={{ scrollbarWidth: "thin" }}
      >
        {activeExams.length === 0 ? (
          <EmptyCta onBrowse={onBrowse} />
        ) : (
          activeExams.map(exam => <SessionCard key={exam.id} exam={exam} />)
        )}
      </div>
    </div>
  );
}
