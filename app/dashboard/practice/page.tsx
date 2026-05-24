"use client";
import { useState, useMemo } from "react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import ExamCard from "../components/practices/ExamCard";
import FilterSidebar from "../components/practices/FilterSidebar";
import FreeAccountBanner from "../components/practices/FreeAccountBanner";
import DebounceInput from "../util/shared/DebounceInput";
import UnlockSectionBanner from "../components/practices/UnlockSection";
import SessionSetupModal from "../components/practices/StartSessionModal";
import PracticeIntakeModal from "../components/practices/PracticeIntakeModal";
import ActiveSessionsStrip from "../components/practices/ActiveSessionsStrip";
import QuickActions from "../components/practices/QuickActions";
import UpdateExamsModal from "../components/practices/UpdateExamsModal";
import { X, SlidersHorizontal, ChevronRight, ArrowUpDown, Sparkles, BookOpenCheck } from "lucide-react";
import { useGetDashboardOverview } from "../util/apis/dashboard/fetchDashboardOverview";
import { useGetAvailableExamsDetails } from "../util/apis/practice/availableExamsDetails";
import { useGetExamsByCategory } from "../util/apis/practice/categories";
import { useUserCategories } from "../util/hooks/useUserCategories";
import { SidebarExamPick } from "../components/practices/FilterSidebar";
import BrowseCard from "../components/practices/BrowseCard";
import { ChevronLeft } from "lucide-react";
import { Userexam } from "../util/types/dashboard/dashbaordOverview";
import { TourAutoStart } from "../util/tour/TourContext";
import { isProductionGated } from "@/components/shared/coming-soon-gate";

export interface Exam {
  id: number;                 // exam_type id — used to fetch exam subjects/details
  examConfigId?: number;      // Userexam.id — sent as exam_config_id when starting a session
  name: string;
  description: string;
  questions: number;
  topics: number;
  difficulty: string;
  freeAccess: number;
  lastScore: number | null;
  progress: number;
  badge: string | null;
  category: string;
  access: "free" | "premium";
  difficulty_level: "easy" | "medium" | "hard";
  started: boolean;
  sessionId?: number;
  // When the card represents a subject under a parent exam (browsing flow):
  subjectId?: number;
  subjectName?: string;
}

export interface Filters {
  category: string;
  access: string;
  difficulty: string;
}

interface ChipProps { label: string; onRemove: () => void; }

export function getBadgeClass(badge: string | null): string {
  switch (badge) {
    case "Most Popular": return "bg-[#E2F9F066]/40 text-[#10B97D] border-[0.4px] border-[#10B97D]";
    case "Top Rated":    return "bg-[#EDEDFE66]/40 text-[#4E49F6] border-[0.4px] border-[#4E49F6]";
    case "Premium":      return "bg-[#FFF4DF66]/40 text-[#FEAA2A] border-[0.4px] border-[#FEAA2A]";
    default:             return "bg-slate-100 text-slate-600 border border-slate-200";
  }
}

export function getBorderClass(difficulty_level: Exam["difficulty_level"]): string {
  switch (difficulty_level) {
    case "easy":   return "border-emerald-200 hover:border-emerald-400";
    case "medium": return "border-amber-200 hover:border-amber-400";
    case "hard":   return "border-red-200 hover:border-red-400";
    default:       return "border-slate-200 hover:border-slate-300";
  }
}

function mapUserExamToExam(ue: Userexam): Exam | null {
  const et = ue.exam;
  // Guard: a freshly-created config may come back before the server has
  // hydrated the nested exam. Skip those rows rather than crashing.
  if (!et) return null;
  const diff = (et.difficulty_level ?? "medium").toLowerCase() as Exam["difficulty_level"];
  return {
    id: et.id,
    examConfigId: ue.config_id,
    name: et.name,
    description: "",
    questions: et.total_questions ?? 0,
    topics: et.total_topics ?? et.subjects?.length ?? 0,
    difficulty: diff.charAt(0).toUpperCase() + diff.slice(1),
    freeAccess: 50,
    lastScore: et.last_score ?? null,
    progress: et.last_score ?? 0,
    badge: null,
    category: et.name,
    access: "free",
    difficulty_level: diff,
    started: et.active_session_id != null,
    sessionId: et.active_session_id ?? undefined,
  };
}

function Chip({ label, onRemove }: ChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/30">
      {label}
      <button onClick={onRemove} className="text-indigo-400 dark:text-indigo-300/70 hover:text-indigo-700 dark:hover:text-indigo-200 font-bold">×</button>
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonGrid() {
  const bar = "bg-slate-100 dark:bg-zinc-800 animate-pulse";
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900 rounded-[.875rem] border border-[#E2E8F0] dark:border-zinc-800 py-4 flex flex-col gap-3">
          <div className="px-4 border-b border-[#EEF0F4] dark:border-zinc-800 pb-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className={`h-4 w-24 rounded ${bar}`} />
              <div className={`h-5 w-16 rounded-full ${bar}`} />
            </div>
            <div className={`h-3 w-full rounded ${bar}`} />
            <div className={`h-3 w-3/4 rounded ${bar}`} />
          </div>
          <div className="grid grid-cols-4 border-b border-[#EEF0F4] dark:border-zinc-800 pb-3 px-4 gap-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="space-y-1.5">
                <div className={`h-4 w-8 rounded ${bar}`} />
                <div className={`h-3 w-10 rounded ${bar}`} />
              </div>
            ))}
          </div>
          <div className="px-4 space-y-1.5">
            <div className={`h-3 w-20 rounded ${bar}`} />
            <div className={`h-1.5 w-full rounded-full ${bar}`} />
          </div>
          <div className="px-4">
            <div className={`h-9 w-full rounded-[.625rem] mt-3 ${bar}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 px-6">
      <div className="w-14 h-14 mx-auto rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center mb-4">{icon}</div>
      <p className="text-slate-800 dark:text-zinc-100 font-semibold text-base">{title}</p>
      <p className="text-slate-400 dark:text-zinc-500 text-sm mt-1 max-w-sm mx-auto">{body}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
// const PAGE_SIZE = 20;

type SortKey = "recommended" | "questions_desc" | "difficulty_asc" | "progress_desc";

export default function PracticeExamsPage() {
  const [sessionExam, setSessionExam]   = useState<Exam | null>(null);
  const [filters, setFilters]           = useState<Filters>({ category: "All Exams", access: "All", difficulty: "Any Level" });
  const [search, setSearch]             = useState<string>("");
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [selectedExamPick, setSelectedExamPick] = useState<SidebarExamPick | null>(null);
  // Drill-down state for the library browse view in the main grid.
  // null = show the top-level categories. Set to a category id when the user
  // clicks a category card; cleared when they hit "Back" or the breadcrumb.
  const [browseCategoryId, setBrowseCategoryId]       = useState<number | null>(null);
  const [browseCategoryName, setBrowseCategoryName]   = useState<string | null>(null);
  const [intakeOpen, setIntakeOpen]     = useState(false);
  const [examsModalOpen, setExamsModalOpen] = useState(false);
  const [sortBy, setSortBy]             = useState<SortKey>("recommended");
  const [category, setCategory]         = useState<string>("All");

  const { data: overviewResponse, isLoading: overviewLoading, isFetching } = useGetDashboardOverview();

  // Lazy-load the picked exam's detail (which carries the subjects[]). Empty
  // string keeps the underlying useQuery disabled until the user picks.
  const examDetailId = selectedExamPick ? String(selectedExamPick.examId) : "";
  const { data: examDetailResp, isLoading: examDetailLoading } = useGetAvailableExamsDetails(examDetailId);

  // Library browse: top-level categories and (when one is drilled into) its
  // exam types. We use the user-scoped category list so users only see
  // categories that contain their own configured exams.
  const { userCategories, isLoading: categoriesLoading } = useUserCategories();
  const { data: examsByCategoryResp, isLoading: examsByCategoryLoading } = useGetExamsByCategory(browseCategoryId);

  // Intersect the picked-category's exams with the user's enrolled exams so
  // the drill-down view also hides exams the user hasn't added.
  const userExamIdsInCategory = useMemo(
    () =>
      new Set(
        (userCategories.find((c) => c.id === browseCategoryId)?.exams ?? []).map(
          (e) => e.id,
        ),
      ),
    [userCategories, browseCategoryId],
  );

  const isLoading =
    overviewLoading ||
    (selectedExamPick != null && examDetailLoading) ||
    (browseCategoryId != null && examsByCategoryLoading) ||
    (selectedExamPick == null && browseCategoryId == null && categoriesLoading);

  const apiExams = useMemo<Exam[]>(() => {
    // Browsing mode: a category exam was picked in the sidebar → render its
    // subjects as cards. Each card carries the parent exam id (so starting
    // a session targets the right exam type) plus the subject id/name so
    // the session-setup modal can lock the subject.
    if (selectedExamPick && examDetailResp?.data) {
      const ex = examDetailResp.data;
      const parentDiff = (ex as unknown as { difficulty_level?: string }).difficulty_level;
      return (ex.subjects ?? []).map((sub) => {
        const diff = (sub.difficulty_level ?? parentDiff ?? "medium")
          .toString()
          .toLowerCase() as Exam["difficulty_level"];
        return {
          id: ex.id,
          name: sub.name,
          description: `${ex.name} · ${sub.name}`,
          questions: 0,
          topics: 0,
          difficulty: diff.charAt(0).toUpperCase() + diff.slice(1),
          freeAccess: 50,
          lastScore: null,
          progress: 0,
          badge: sub.is_premium ? "Premium" : null,
          category: ex.name,
          access: sub.is_premium ? "premium" : "free",
          difficulty_level: diff,
          started: false,
          subjectId: sub.id,
          subjectName: sub.name,
        };
      });
    }

    // Default: list the user's own exams as before.
    const userExams = overviewResponse?.data?.user_exams ?? [];
    return userExams
      .map(mapUserExamToExam)
      .filter((e): e is Exam => e !== null);
  }, [selectedExamPick, examDetailResp, overviewResponse]);

  // When the user clicks a subject card, the chosen Exam already carries the
  // subjectId/subjectName so the session-setup modal can pre-select + lock
  // that subject. Reading off `sessionExam` keeps the wiring single-sourced.
  const preselectedSubject: { id: number; name: string } | null =
    sessionExam?.subjectId != null && sessionExam.subjectName
      ? { id: sessionExam.subjectId, name: sessionExam.subjectName }
      : null;

  const activeExams = useMemo<Exam[]>(
    () => apiExams.filter(e => e.started),
    [apiExams],
  );

 

  const filtered = useMemo<Exam[]>(() => {
    const diffRank: Record<Exam["difficulty_level"], number> = { easy: 1, medium: 2, hard: 3 };
    const result = apiExams.filter(exam => {
      if (category !== "All" && exam.category !== category) return false;
      if (filters.access === "Free"    && exam.access !== "free")    return false;
      if (filters.access === "Premium" && exam.access !== "premium") return false;
      if (filters.difficulty !== "Any Level" && exam.difficulty_level !== filters.difficulty.toLowerCase()) return false;
      if (search && !exam.name.toLowerCase().includes(search.toLowerCase()) && !exam.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    const sorted = [...result];
    if (sortBy === "questions_desc") sorted.sort((a, b) => b.questions - a.questions);
    else if (sortBy === "difficulty_asc") sorted.sort((a, b) => diffRank[a.difficulty_level] - diffRank[b.difficulty_level]);
    else if (sortBy === "progress_desc") sorted.sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));
    else sorted.sort((a, b) => Number(b.started) - Number(a.started)); // recommended: in-progress first
    return sorted;
  }, [apiExams, filters, search, category, sortBy]);

  const clearAll = () => {
    setFilters({ category: "All Exams", access: "All", difficulty: "Any Level" });
    setSearch("");
  };

  const hasActiveFilters =
    filters.category !== "All Exams" || filters.access !== "All" ||
    filters.difficulty !== "Any Level" || !!search;

  const totalCount = apiExams.length;

  return (
    <div className="bg-white dark:bg-zinc-950 font-inter min-h-screen text-slate-900 dark:text-zinc-100">
      <DashboardHeader />
      <TourAutoStart tourId="practice" />

      <div className="max-w-400 mx-auto px-4 sm:px-6 py-6">
        <ActiveSessionsStrip
          activeExams={activeExams}
          onBrowse={() => {
            if (typeof window !== "undefined") {
              window.scrollTo({ top: window.innerHeight * 0.5, behavior: "smooth" });
            }
          }}
        />

        <QuickActions
          onAIGenerate={() => setIntakeOpen(true)}
          onRandom={() => { setFilters(f => ({ ...f, difficulty: "Any Level" })); setCategory("All"); }}
          onQuickQuiz={() => { setFilters(f => ({ ...f, difficulty: "Easy" })); }}
          onWeakTopics={() => { /* routes to progress in future */ }}
        />

        <div className="flex gap-6 items-start">

          {/* Desktop Sidebar */}
          <div className="hidden lg:block self-start sticky top-6 shrink-0">
            <div className="max-h-[calc(100vh-3rem)] overflow-y-auto">
              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                onExamPick={(pick) => {
                  setSelectedExamPick(pick);
                  if (pick) { setBrowseCategoryId(pick.categoryId); setBrowseCategoryName(pick.categoryName); }
                  else      { setBrowseCategoryId(null);             setBrowseCategoryName(null); }
                }}
                selectedExamId={selectedExamPick?.examId ?? null}
              />
            </div>
          </div>

          {/* Mobile Sidebar Drawer */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={() => setSidebarOpen(false)} />
              <div className="relative bg-white dark:bg-zinc-900 w-72 max-w-[85vw] h-full overflow-y-auto p-4 shadow-xl border-r border-slate-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-slate-800 dark:text-zinc-100">Filters</p>
                  <button onClick={() => setSidebarOpen(false)} className="text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-200 p-1">
                    <X size={18} />
                  </button>
                </div>
                <FilterSidebar
                  filters={filters}
                  setFilters={setFilters}
                  onExamPick={(pick) => {
                    setSelectedExamPick(pick);
                    if (pick) { setBrowseCategoryId(pick.categoryId); setBrowseCategoryName(pick.categoryName); }
                    else      { setBrowseCategoryId(null);             setBrowseCategoryName(null); }
                    setSidebarOpen(false);
                  }}
                  selectedExamId={selectedExamPick?.examId ?? null}
                />
              </div>
            </div>
          )}

          {/* Main */}
          <div className="flex-1 min-w-0">

            {/* Header row */}
            <div className="flex flex-wrap flex-row sm:items-center justify-between mb-4 gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100">All Practice Exams</h1>
                <p className="text-sm text-slate-400 dark:text-zinc-500 mt-0.5">
                  <span className="font-semibold text-[#0F172B] dark:text-zinc-200">{totalCount > 0 ? totalCount : filtered.length}</span> exams available for your account
                </p>
              </div>
              <div data-tour="practice-filters" className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {/* <div className="relative">
                  <ArrowUpDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as SortKey)}
                    className="appearance-none text-sm font-semibold h-10 pl-8 pr-8 rounded-[10px] border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer focus:outline-none focus:border-slate-300 dark:focus:border-zinc-600 bg-white dark:bg-zinc-900"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="questions_desc">Most questions</option>
                    <option value="difficulty_asc">Easiest first</option>
                    <option value="progress_desc">My progress</option>
                  </select>
                  <ChevronRight size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 rotate-90 pointer-events-none" />
                </div> */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 text-sm font-semibold h-10 px-3 rounded-[10px] border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
                >
                  <SlidersHorizontal size={15} />
                  Filters
                  {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                </button>
                <div className="flex-1 sm:flex-none">
                  <DebounceInput
                    onChange={(e) => { setSearch(e); }}
                    value={search}
                    placeHolder="Search for exams..."
                    className="bg-transparent w-full"
                    containerClassName="w-full sm:min-w-[200px] lg:min-w-[270px]"
                    iconPosition="left"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setExamsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold h-10 px-3 rounded-[10px] border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
                >
                  <BookOpenCheck size={15} />
                  <span className="hidden sm:inline">Add new exams</span>
                </button>
              </div>
            </div>

            <button
              data-tour="practice-intake"
              onClick={() => setIntakeOpen(true)}
              className="sm:hidden w-full flex items-center justify-center gap-2 text-white font-bold text-sm px-5 py-3 rounded-[10px] transition-all shadow-sm mb-4"
              style={{ background: "linear-gradient(135deg, #FE9A00, #FF6900)" }}
            >
              <Sparkles size={14} />
              Generate from PDF / screenshot
            </button>

            <FreeAccountBanner />


            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4 items-center">
                {filters.category !== "All Exams"  && <Chip label={filters.category}  onRemove={() => setFilters(f => ({ ...f, category: "All Exams" }))} />}
                {filters.access !== "All"          && <Chip label={filters.access}    onRemove={() => setFilters(f => ({ ...f, access: "All" }))} />}
                {filters.difficulty !== "Any Level" && <Chip label={filters.difficulty} onRemove={() => setFilters(f => ({ ...f, difficulty: "Any Level" }))} />}
                {search && <Chip label={`"${search}"`} onRemove={() => setSearch("")} />}
                <button onClick={clearAll} className="text-xs text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 underline">Clear all</button>
              </div>
            )}

            {/* Drill-down breadcrumb. Visible whenever the user has stepped
                into a category or exam, so they always know where they are
                and can step back out without going through the sidebar. */}
            {(browseCategoryId || selectedExamPick) && (
              <nav aria-label="Library breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs">
                <button
                  onClick={() => { setBrowseCategoryId(null); setBrowseCategoryName(null); setSelectedExamPick(null); }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  <ChevronLeft size={12} /> All categories
                </button>
                {browseCategoryName && (
                  <>
                    <span className="text-slate-300 dark:text-zinc-600">/</span>
                    <button
                      onClick={() => setSelectedExamPick(null)}
                      className={`px-2 py-1 rounded-md font-semibold ${selectedExamPick ? "text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800" : "text-slate-700 dark:text-zinc-200"}`}
                    >
                      {browseCategoryName}
                    </button>
                  </>
                )}
                {selectedExamPick && (
                  <>
                    <span className="text-slate-300 dark:text-zinc-600">/</span>
                    <span className="px-2 py-1 rounded-md font-semibold text-slate-700 dark:text-zinc-200">{selectedExamPick.examName}</span>
                  </>
                )}
              </nav>
            )}

            {/* Main grid */}
            {isLoading ? (
              <SkeletonGrid />
            ) : selectedExamPick ? (
              // ── Subjects of the picked exam ──────────────────────────────
              filtered.length === 0 ? (
                <EmptyState
                  icon={<Sparkles size={22} className="text-[#894B00] dark:text-amber-400" />}
                  title="No subjects yet"
                  body="This exam doesn't have any subjects published yet."
                />
              ) : (
                <div data-tour="practice-list" className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 transition-opacity duration-200 ${isFetching && !isLoading ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
                  {filtered.map((exam, i) => (
                    <div key={`${exam.id}-${exam.subjectId ?? i}`} data-tour={i === 0 ? "practice-card" : undefined} className="h-full">
                      <ExamCard
                        exam={exam}
                        isPremiumLocked={exam.access === "premium"}
                        onStart={() => setSessionExam(exam)}
                      />
                    </div>
                  ))}
                </div>
              )
            ) : browseCategoryId ? (
              // ── Exam types in the chosen category (filtered to user's) ──
              (() => {
                const exams = (examsByCategoryResp?.data ?? []).filter((ex) =>
                  userExamIdsInCategory.has(ex.id),
                );
                return exams.length === 0 ? (
                  <EmptyState
                    icon={<Sparkles size={22} className="text-[#894B00] dark:text-amber-400" />}
                    title="No exams in this category"
                    body="You haven't added any exams from this category yet."
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {exams.map((ex) => (
                      <BrowseCard
                        key={ex.id}
                        name={ex.name}
                        description={ex.description}
                        badge={ex.is_premium ? "Premium" : null}
                        meta={`${ex.subject_count} ${ex.subject_count === 1 ? "subject" : "subjects"}`}
                        onClick={() => setSelectedExamPick({
                          examId: ex.id,
                          examName: ex.name,
                          categoryId: browseCategoryId!,
                          categoryName: browseCategoryName ?? "",
                        })}
                      />
                    ))}
                  </div>
                );
              })()
            ) : (
              // ── Top-level categories — only ones the user has exams in ──
              userCategories.length === 0 ? (
                <EmptyState
                  icon={<BookOpenCheck size={22} className="text-indigo-600 dark:text-indigo-300" />}
                  title="No exams yet"
                  body="Add an exam to your study plan to see its category here."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {userCategories.map((cat) => (
                    <BrowseCard
                      key={cat.id}
                      name={cat.name}
                      description={cat.description}
                      meta={`${cat.exams.length} ${cat.exams.length === 1 ? "exam" : "exams"}`}
                      onClick={() => { setBrowseCategoryId(cat.id); setBrowseCategoryName(cat.name); }}
                    />
                  ))}
                </div>
              )
            )}

            <div className="mt-6">
              <UnlockSectionBanner />
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
     {!isProductionGated() && <button
        onClick={() => setIntakeOpen(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 text-white text-sm font-bold px-4 sm:px-5 py-3 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 z-40 cursor-pointer"
        style={{ background: "linear-gradient(135deg, #FE9A00, #FF6900)" }}
      >
        ＋ <span className="hidden sm:inline">AI Practice Generator</span>
        <span className="sm:hidden">AI</span>
      </button>}

      <PracticeIntakeModal open={intakeOpen} onClose={() => setIntakeOpen(false)} />

      <UpdateExamsModal
        open={examsModalOpen}
        onClose={() => setExamsModalOpen(false)}
      />

      {sessionExam && (
        <SessionSetupModal
          examName={sessionExam.name}
          examDesc={sessionExam.description}
          open={sessionExam}
          onClose={() => setSessionExam(null)}
          preselectedSubject={preselectedSubject}
          aiGenerate={preselectedSubject != null}
        />
      )}
    </div>
  );
}