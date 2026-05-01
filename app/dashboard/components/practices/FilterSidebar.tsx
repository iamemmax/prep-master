import { useMemo, useState } from "react";
import {
  ChevronDown,
  Coins,
  Crown,
  Flame,
  Target,
  CalendarClock,
  ArrowUpRight,
} from "lucide-react";
import { Filters } from "../../practice/page";
import SidebarBtn from "./SidebarBtn";
import { useGetDashboardOverview } from "../../util/apis/dashboard/fetchDashboardOverview";
import { useUserSubscription } from "../../util/apis/subscription/subscription";
import { useCreditBalance } from "../../util/hooks/useCreditBalance";
import { useSubscription } from "../subscription/SubscriptionProvider";

// interface ProgressBarEntry {
//   label: string;
//   pct: number;
//   color: string;
// }

interface FilterSidebarProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onExamSelect?: (ref: string | null) => void;
  selectedExamRef?: string | null;
}

// const ACCESS_OPTIONS: string[] = ["All", "Free", "Premium"];
// const DIFFICULTY_OPTIONS: string[] = ["Any Level", "Beginner", "Intermediate ", "Advanced"];

// const MY_PROGRESS: ProgressBarEntry[] = [
//   { label: "SAT", pct: 72, color: "#6366F1" },
//   { label: "GRE", pct: 45, color: "#3B82F6" },
//   { label: "LSAT", pct: 12, color: "#8B5CF6" },
// ];

function SidebarGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-5 mb-1 px-2">
      {children}
    </p>
  );
}

interface SidebarExam {
  reference: string;
  name: string;
  subjects: { reference: string; name: string }[];
}

const FilterSidebar = ({ filters, setFilters, onExamSelect, selectedExamRef = null }: FilterSidebarProps) => {
  const { category } = filters;
  const { data: response, isLoading } = useGetDashboardOverview();
  const { data: subResp } = useUserSubscription();
  const { remaining, total } = useCreditBalance();
  const { openUpgradeModal } = useSubscription();
  const overview = response?.data?.overview;
  const userExams = useMemo(
    () => response?.data?.user_exams ?? [],
    [response],
  );

  // Earliest scheduled exam by date string. Pure: no Date.now() inside the
  // memo — the actual "days left" comes from `overview.days_remaining`,
  // which the backend computes server-side. We also drop rows with a missing
  // joined exam (the backend can return `exam: null` for fresh configs).
  const nextExam = useMemo(() => {
    const withDates = userExams
      .filter((e) => e.exam_date && e.exam)
      .map((e) => ({ name: e.exam.name, date: e.exam_date as string }));
    withDates.sort((a, b) => a.date.localeCompare(b.date));
    return withDates[0] ?? null;
  }, [userExams]);

  const activeSub =
    subResp?.data?.is_subscribed && subResp?.data?.subscription?.is_valid
      ? subResp.data.subscription
      : null;
  const creditPct = total > 0 ? Math.min(100, Math.round((remaining / total) * 100)) : 0;
  const creditTone =
    creditPct > 50 ? "bg-emerald-500"
    : creditPct > 20 ? "bg-[#F7C948]"
    : "bg-rose-500";

  const rawList = useMemo<SidebarExam[]>(() => {
    const userExams = response?.data?.user_exams ?? [];
    const seen = new Set<string>();
    return userExams.reduce<SidebarExam[]>((acc, ue) => {
      const ref = ue.exam?.reference;
      if (!ref || seen.has(ref)) return acc;
      seen.add(ref);
      acc.push({
        reference: ref,
        name: ue.exam.name,
        subjects: ue.exam.subjects ?? [],
      });
      return acc;
    }, []);
  }, [response]);

  const initialOpen =
    rawList.find(
      (exam) =>
        exam.name === category ||
        exam.subjects.some((s) => s.name === category)
    )?.reference ?? null;

  const [openExam, setOpenExam] = useState<string | null>(initialOpen);

  const set = (key: keyof Filters) => (v: string) =>
    setFilters(f => ({ ...f, [key]: v }));

  const handleExamClick = (exam: { reference: string; name: string }) => {
    set("category")(exam.name);
    onExamSelect?.(exam.reference);
    setOpenExam((prev) => (prev === exam.reference ? null : exam.reference));
  };

  return (
    <aside className="w-56 shrink-0 pt-1">
      <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2 px-2">
        FILTER
      </p>

      <SidebarGroupLabel>Exam</SidebarGroupLabel>
      <div className="space-y-1">
        {/* All Exams */}
        <SidebarBtn
          label="All Exams"
          active={!selectedExamRef && category === "All Exams"}
          onClick={() => { set("category")("All Exams"); onExamSelect?.(null); }}
        />

        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 mx-2 rounded-lg bg-slate-100 dark:bg-zinc-800 animate-pulse" />
          ))
        ) : (
          rawList.map((exam) => {
            const isOpen = openExam === exam.reference;
            const isActive = selectedExamRef === exam.reference;
            const hasSubjects = (exam.subjects?.length ?? 0) > 0;

            return (
              <div key={exam.reference}>
                {/* Exam name header — toggles accordion + selects exam */}
                <button
                  onClick={() => handleExamClick(exam)}
                  className={`w-full flex items-center justify-between px-3 font-inter cursor-pointer py-2 rounded-lg text-xs transition-all duration-150 ${
                    isActive
                      ? "bg-[#F7C948] text-black font-semibold border-[0.3px] border-[#F7C948]"
                      : "text-[#616980] dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100 font-normal"
                  }`}
                >
                  <span className="text-left">{exam.name}</span>
                  {hasSubjects && (
                    <ChevronDown
                      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-150 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Subjects — only when accordion open */}
                {hasSubjects && isOpen && (
                  <div className="mt-0.5 ml-3 space-y-0.5 border-l border-slate-200 dark:border-zinc-800 pl-2">
                    {exam.subjects.map((subject) => (
                      <SidebarBtn
                        key={subject.reference}
                        label={subject.name}
                        active={selectedExamRef === subject.reference}
                        onClick={() => { set("category")(subject.name); onExamSelect?.(subject.reference); }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Plan / credits — quick read on quota and an upgrade nudge if free */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800">
        <SidebarGroupLabel>Plan</SidebarGroupLabel>
        <div className="px-2">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="inline-flex items-center gap-1 text-slate-600 dark:text-zinc-300 font-semibold">
              <Coins size={11} className="text-[#F7C948]" />
              AI credits
            </span>
            <span className="tabular-nums text-slate-500 dark:text-zinc-400">
              {remaining.toLocaleString()}
              {total > 0 && total !== remaining && (
                <span className="text-slate-400 dark:text-zinc-500">/{total.toLocaleString()}</span>
              )}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${creditTone}`} style={{ width: `${creditPct}%` }} />
          </div>

          {activeSub ? (
            <div className="flex items-center justify-between mt-3 text-[11px]">
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-zinc-200">
                <Crown size={11} className="text-[#F7C948]" fill="currentColor" />
                {activeSub.plan.name}
              </span>
              <span className="text-slate-400 dark:text-zinc-500 tabular-nums">
                {activeSub.days_remaining}d left
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={openUpgradeModal}
              data-no-paywall
              className="mt-3 inline-flex items-center justify-center gap-1 w-full text-[11px] font-bold text-[#5A3300] bg-[#F7C948] hover:bg-[#F0BE36] py-1.5 rounded-md transition-colors"
            >
              <Crown size={11} fill="currentColor" />
              Upgrade
              <ArrowUpRight size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Quick stats — pulled from the dashboard overview so the sidebar
          doubles as a tiny "your prep at a glance" panel. */}
      {overview && (
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-zinc-800">
          <SidebarGroupLabel>Your stats</SidebarGroupLabel>
          <ul className="px-2 space-y-1.5">
            <li className="flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-zinc-300">
                <Flame size={11} className="text-[#FE9A00]" />
                Streak
              </span>
              <span className="font-semibold tabular-nums text-slate-700 dark:text-zinc-200">
                {overview.day_streak}d
              </span>
            </li>
            <li className="flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-zinc-300">
                <Target size={11} className="text-emerald-500" />
                Avg score
              </span>
              <span className="font-semibold tabular-nums text-slate-700 dark:text-zinc-200">
                {Math.round(overview.average_score)}%
              </span>
            </li>
            <li className="flex items-center justify-between text-[11px]">
              <span className="text-slate-600 dark:text-zinc-300">Questions</span>
              <span className="font-semibold tabular-nums text-slate-700 dark:text-zinc-200">
                {overview.questions_answered.toLocaleString()}
              </span>
            </li>
            <li className="flex items-center justify-between text-[11px]">
              <span className="text-slate-600 dark:text-zinc-300">Attempts</span>
              <span className="font-semibold tabular-nums text-slate-700 dark:text-zinc-200">
                {overview.total_attempts.toLocaleString()}
              </span>
            </li>
          </ul>
        </div>
      )}

      {/* Next exam countdown — only when the user has a scheduled date.
          `days_remaining` is server-computed so we don't need Date.now() here. */}
      {nextExam && overview && (
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-zinc-800">
          <SidebarGroupLabel>Next exam</SidebarGroupLabel>
          <div className="px-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-zinc-200">
                <CalendarClock size={11} className="text-[#F7C948]" />
                {nextExam.name}
              </span>
              <span className="text-[10px] tabular-nums text-slate-500 dark:text-zinc-400">
                {overview.days_remaining}d
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-[#F7C948] to-[#FE9A00] transition-all"
                style={{ width: `${Math.min(100, Math.max(0, overview.overall_readiness ?? 0))}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1.5 tabular-nums">
              {Math.round(overview.overall_readiness ?? 0)}% ready
              {overview.target_score ? ` · target ${overview.target_score}` : ""}
            </p>
          </div>
        </div>
      )}

      {/* <SidebarGroupLabel>Access</SidebarGroupLabel> */}
      {/* <div className="space-y-1">
        {ACCESS_OPTIONS.map(opt => (
          <SidebarBtn key={opt} label={opt} active={access === opt} onClick={() => set("access")(opt)} />
        ))}
      </div> */}

      {/* <SidebarGroupLabel>Difficulty</SidebarGroupLabel>
      <div className="space-y-1">
        {DIFFICULTY_OPTIONS.map(opt => (
          <SidebarBtn key={opt} label={opt} active={difficulty === opt} onClick={() => set("difficulty")(opt)} />
        ))}
      </div> */}

      {/* <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800">
        <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3 px-2">
          My Progress
        </p>
        {MY_PROGRESS.map(({ label, pct, color }) => (
          <div key={label} className="mb-3 px-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-zinc-300 font-medium">{label}</span>
              <span className="text-slate-400 dark:text-zinc-500">{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        ))}
      </div> */}
    </aside>
  );
};

export default FilterSidebar;