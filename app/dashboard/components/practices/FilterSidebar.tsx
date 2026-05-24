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
import { useUserCategories } from "../../util/hooks/useUserCategories";

export interface SidebarExamPick {
  examId: number;
  examName: string;
  categoryId: number;
  categoryName: string;
}

interface FilterSidebarProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  /** Called when the user picks an exam from a category. Pass `null` to clear. */
  onExamPick?: (pick: SidebarExamPick | null) => void;
  selectedExamId?: number | null;
}

function SidebarGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-5 mb-1 px-2">
      {children}
    </p>
  );
}

const FilterSidebar = ({ filters, setFilters, onExamPick, selectedExamId = null }: FilterSidebarProps) => {
  const { category } = filters;
  const { data: response } = useGetDashboardOverview();
  const { data: subResp } = useUserSubscription();
  const { remaining, total } = useCreditBalance();
  const { openUpgradeModal } = useSubscription();
  const overview = response?.data?.overview;
  const userExams = useMemo(
    () => response?.data?.user_exams ?? [],
    [response],
  );

  const { userCategories, isLoading: categoriesLoading, error: catsError } = useUserCategories();

  // Track which category is expanded. Only one open at a time keeps the
  // sidebar from growing into a wall of nested lists.
  const [openCategoryId, setOpenCategoryId] = useState<number | null>(null);

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

  const set = (key: keyof Filters) => (v: string) =>
    setFilters(f => ({ ...f, [key]: v }));

  return (
    <aside className="w-56 shrink-0 pt-1">
      <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2 px-2">
        FILTER
      </p>

      {/* <SidebarGroupLabel>Categories</SidebarGroupLabel> */}
      <div className="space-y-1">
        <SidebarBtn
          label="All Exams"
          active={selectedExamId == null && category === "All Exams"}
          onClick={() => { set("category")("All Exams"); onExamPick?.(null); setOpenCategoryId(null); }}
        />

        {categoriesLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 mx-2 rounded-lg bg-slate-100 dark:bg-zinc-800 animate-pulse" />
          ))
        ) : catsError ? (
          <p
            className="px-3 py-2 text-[11px] text-rose-500 wrap-break-word"
            title={catsError instanceof Error ? catsError.message : String(catsError)}
          >
            Couldn&apos;t load categories: {catsError instanceof Error ? catsError.message : "unknown error"}
          </p>
        ) : userCategories.length === 0 ? (
          <p className="px-3 py-2 text-[11px] text-slate-400 dark:text-zinc-500">
            No exams yet. Add one to see categories.
          </p>
        ) : (
          userCategories.map((cat) => {
            const isOpen = openCategoryId === cat.id;
            return (
              <div key={cat.id}>
                <button
                  onClick={() => setOpenCategoryId((prev) => (prev === cat.id ? null : cat.id))}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-inter cursor-pointer transition-colors duration-150 ${
                    isOpen
                      ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold"
                      : "text-[#616980] dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100"
                  }`}
                  title={cat.description ?? undefined}
                >
                  <span className="text-left truncate">{cat.name}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="mt-0.5 ml-3 space-y-0.5 border-l border-slate-200 dark:border-zinc-800 pl-2">
                    {cat.exams.map((exam) => (
                      <SidebarBtn
                        key={exam.id}
                        label={exam.name}
                        active={selectedExamId === exam.id}
                        onClick={() => {
                          set("category")(cat.name);
                          onExamPick?.({
                            examId: exam.id,
                            examName: exam.name,
                            categoryId: cat.id,
                            categoryName: cat.name,
                          });
                        }}
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
      {/* {overview && (
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
      )} */}

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
    </aside>
  );
};

export default FilterSidebar;
