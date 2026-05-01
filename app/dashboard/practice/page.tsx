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

// ─── Page ─────────────────────────────────────────────────────────────────────
// const PAGE_SIZE = 20;

type SortKey = "recommended" | "questions_desc" | "difficulty_asc" | "progress_desc";

export default function PracticeExamsPage() {
  const [sessionExam, setSessionExam]   = useState<Exam | null>(null);
  const [filters, setFilters]           = useState<Filters>({ category: "All Exams", access: "All", difficulty: "Any Level" });
  const [search, setSearch]             = useState<string>("");
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [selectedExamRef, setSelectedExamRef] = useState<string | null>(null);
  const [intakeOpen, setIntakeOpen]     = useState(false);
  const [examsModalOpen, setExamsModalOpen] = useState(false);
  const [sortBy, setSortBy]             = useState<SortKey>("recommended");
  const [category, setCategory]         = useState<string>("All");

  const { data: overviewResponse, isLoading: overviewLoading, isFetching } = useGetDashboardOverview();

  const isLoading = overviewLoading;

  const apiExams = useMemo<Exam[]>(() => {
    const userExams = overviewResponse?.data?.user_exams ?? [];

    if (selectedExamRef) {
      // Try the exam ref first, then fall back to a subject ref. Everything
      // we need to render the card already lives in user_exams — no extra
      // endpoint call is needed.
      const examMatch = userExams.find(ue => ue.exam?.reference === selectedExamRef);
      if (examMatch) {
        const mapped = mapUserExamToExam(examMatch);
        return mapped ? [mapped] : [];
      }
      const subjectMatch = userExams.find(ue =>
        ue.exam?.subjects?.some(s => s.reference === selectedExamRef)
      );
      if (subjectMatch) {
        const subj = subjectMatch.exam.subjects.find(s => s.reference === selectedExamRef);
        if (!subj) return [];
        const diff = (subj.difficulty_level ?? subjectMatch.exam.difficulty_level ?? "medium")
          .toString()
          .toLowerCase() as Exam["difficulty_level"];
        return [{
          id: subjectMatch.exam.id,
          examConfigId: subjectMatch.config_id,
          name: subj.name,
          description: `${subjectMatch.exam.name} · ${subj.name}`,
          questions: subj.total_questions ?? 0,
          topics: subj.total_topics ?? 0,
          difficulty: diff.charAt(0).toUpperCase() + diff.slice(1),
          freeAccess: 50,
          lastScore: subjectMatch.exam.last_score ?? null,
          progress: subjectMatch.exam.last_score ?? 0,
          badge: null,
          category: subjectMatch.exam.name,
          access: "free",
          difficulty_level: diff,
          started: subjectMatch.exam.active_session_id != null,
          sessionId: subjectMatch.exam.active_session_id ?? undefined,
        }];
      }
      return [];
    }

    return userExams
      .map(mapUserExamToExam)
      .filter((e): e is Exam => e !== null);
  }, [selectedExamRef, overviewResponse]);

  // If the user picked a specific subject in the sidebar (rather than a whole
  // exam), find it inside user_exams so we can pre-select + lock it in the
  // session-setup modal.
  const preselectedSubject: { id: number; name: string } | null = (() => {
    if (!selectedExamRef) return null;
    for (const ue of overviewResponse?.data?.user_exams ?? []) {
      const subj = ue.exam?.subjects?.find((s) => s.reference === selectedExamRef);
      if (subj) return { id: subj.id, name: subj.name };
    }
    return null;
  })();

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
                onExamSelect={setSelectedExamRef}
                selectedExamRef={selectedExamRef}
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
                  onExamSelect={setSelectedExamRef}
                  selectedExamRef={selectedExamRef}
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

            {/* Exam grid */}
            {isLoading ? (
              <SkeletonGrid />
            ) : !selectedExamRef && (overviewResponse?.data?.user_exams ?? []).length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 px-6">
                <div className="w-14 h-14 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center mb-4">
                  <BookOpenCheck size={22} className="text-indigo-600 dark:text-indigo-300" />
                </div>
                <p className="text-slate-800 dark:text-zinc-100 font-semibold text-base">No exams added yet</p>
                <p className="text-slate-400 dark:text-zinc-500 text-sm mt-1 max-w-sm mx-auto">
                  Add the exams you&apos;re preparing for to see practice cards tailored to you.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
                  <button
                    onClick={() => setExamsModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                  >
                    <BookOpenCheck size={13} />
                    Add exams
                  </button>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 px-6">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#FFF4DF] dark:bg-amber-500/15 flex items-center justify-center mb-4">
                  <Sparkles size={22} className="text-[#894B00] dark:text-amber-400" />
                </div>
                <p className="text-slate-800 dark:text-zinc-100 font-semibold text-base">No exams match your filters</p>
                <p className="text-slate-400 dark:text-zinc-500 text-sm mt-1 max-w-sm mx-auto">
                  Try removing a filter, or generate custom practice from your own material.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
                  {hasActiveFilters && (
                    <button
                      onClick={clearAll}
                      className="text-xs font-semibold px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
                  {
                    !isProductionGated() &&
                  <button
                    onClick={() => setIntakeOpen(true)}
                    className="text-xs font-bold px-4 py-2 rounded-lg text-white transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #FE9A00, #FF6900)" }}
                  >
                    Generate questions with AI →
                  </button>
                  }
                </div>
              </div>
            ) : (
              <>
                {/* Dim grid while fetching next page (keeps content visible) */}
                <div data-tour="practice-list" className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 transition-opacity duration-200 ${isFetching && !isLoading ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
                  {filtered.map((exam, i) => (
                    <div key={exam.id} data-tour={i === 0 ? "practice-card" : undefined} className="h-full">
                      <ExamCard
                        exam={exam}
                        isPremiumLocked={exam.access === "premium"}
                        onStart={() => setSessionExam(exam)}
                      />
                    </div>
                  ))}
                </div>

              </>
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
        />
      )}
    </div>
  );
}