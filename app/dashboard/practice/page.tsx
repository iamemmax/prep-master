"use client";
import { useState, useMemo } from "react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import ExamCard from "../components/practices/ExamCard";
import FilterSidebar from "../components/practices/FilterSidebar";
import FreeAccountBanner from "../components/practices/FreeAccountBanner";
import DebounceInput from "../util/shared/DebounceInput";
import UnlockSectionBanner from "../components/practices/UnlockSection";
import SessionSetupModal from "../components/practices/StartSessionModal";
import { X, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE_SIZE, useGetPracticeExamList } from "../util/apis/practice/examsList";
import { useGetAvailableExamsDetails } from "../util/apis/practice/availableExamsDetails";
import { availableData } from "../util/types/dashboard/examlisttypes";

export interface Exam {
  id: number;
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

function mapToExam(d: availableData): Exam {
  const diff = (d.available_difficulties?.[0] ?? "medium").toLowerCase() as Exam["difficulty_level"];
  return {
    id: d.id,
    name: d.name,
    description: d.description,
    questions: d.total_questions,
    topics: d.total_topics,
    difficulty: diff.charAt(0).toUpperCase() + diff.slice(1),
    freeAccess: 50,
    lastScore: d.previous_score_percentage ?? null,
    progress: d.previous_score_percentage ?? 0,
    badge: d.is_premium ? "Premium" : null,
    category: d.name,
    access: d.is_premium ? "premium" : "free",
    difficulty_level: diff,
    started: (d.previous_score_percentage ?? 0) > 0,
    sessionId: Number(d?.active_session_id),
  };
}

function ContinueBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl mb-6" style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 60%, #A78BFA 100%)" }}>
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 sm:px-8 py-5 sm:py-6 gap-4">
        <div className="flex-1">
          <p className="text-white font-bold text-lg sm:text-xl leading-tight mb-1">Continue your SAT practice</p>
          <p className="text-purple-200 text-xs sm:text-sm">
            You&apos;re 72% through ·{" "}
            <strong className="text-white font-bold">883 questions remaining</strong> · Last score:{" "}
            <strong className="text-white font-bold">85%</strong>
          </p>
          <div className="mt-3 h-2 rounded-full bg-white/25 w-full sm:w-56 overflow-hidden">
            <div className="h-full rounded-full bg-white" style={{ width: "72%" }} />
          </div>
        </div>
        <button className="shrink-0 bg-white text-indigo-700 font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto">
          Continue →
        </button>
      </div>
    </div>
  );
}

function Chip({ label, onRemove }: ChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-200">
      {label}
      <button onClick={onRemove} className="text-indigo-400 hover:text-indigo-700 font-bold">×</button>
    </span>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
interface PaginationProps {
  page:       number;
  totalCount: number;
  pageSize:   number;
  hasNext:    boolean;
  hasPrev:    boolean;
  onChange:   (page: number) => void;
  isLoading:  boolean;
}

function Pagination({ page, totalCount, pageSize, hasNext, hasPrev, onChange, isLoading }: PaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  if (totalPages <= 1 && !hasNext && !hasPrev) return null;

  // Build visible page numbers: always show first, last, current ±1
  function getPageNumbers(): (number | "…")[] {
    const pages: (number | "…")[] = [];
    const delta = 1;
    const range: number[] = [];

    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }

    if (range[0] > 2) pages.push(1, "…");
    else pages.push(1);

    pages.push(...range);

    if (range[range.length - 1] < totalPages - 1) pages.push("…", totalPages);
    else pages.push(totalPages);

    return pages;
  }

  const btnBase = "flex items-center justify-center text-sm font-medium rounded-lg transition-all h-9 min-w-[36px] px-2";
  const activeBtn = `${btnBase} bg-indigo-600 text-white`;
  const idleBtn   = `${btnBase} border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300`;
  const disabledBtn = `${btnBase} border border-slate-100 text-slate-300 cursor-not-allowed`;

  const start = (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8 pt-5 border-t border-slate-100">
      {/* Count */}
      <p className="text-xs text-slate-400 shrink-0">
        Showing <span className="font-medium text-slate-600">{start}–{end}</span> of{" "}
        <span className="font-medium text-slate-600">{totalCount}</span> exams
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        {/* Prev */}
        <button
          onClick={() => onChange(page - 1)}
          disabled={!hasPrev || isLoading}
          className={`flex items-center gap-1 ${hasPrev && !isLoading ? idleBtn : disabledBtn}`}
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="w-9 text-center text-slate-400 text-sm select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              disabled={isLoading}
              className={p === page ? activeBtn : idleBtn}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onChange(page + 1)}
          disabled={!hasNext || isLoading}
          className={`flex items-center gap-1 ${hasNext && !isLoading ? idleBtn : disabledBtn}`}
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-[.875rem] border border-[#E2E8F0] py-4 flex flex-col gap-3">
          <div className="px-4 border-b border-[#EEF0F4] pb-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
              <div className="h-5 w-16 rounded-full bg-slate-100 animate-pulse" />
            </div>
            <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
            <div className="h-3 w-3/4 rounded bg-slate-100 animate-pulse" />
          </div>
          <div className="grid grid-cols-4 border-b border-[#EEF0F4] pb-3 px-4 gap-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="space-y-1.5">
                <div className="h-4 w-8 rounded bg-slate-100 animate-pulse" />
                <div className="h-3 w-10 rounded bg-slate-100 animate-pulse" />
              </div>
            ))}
          </div>
          <div className="px-4 space-y-1.5">
            <div className="h-3 w-20 rounded bg-slate-100 animate-pulse" />
            <div className="h-1.5 w-full rounded-full bg-slate-100 animate-pulse" />
          </div>
          <div className="px-4">
            <div className="h-9 w-full rounded-[.625rem] bg-slate-100 animate-pulse mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
// const PAGE_SIZE = 20;

export default function PracticeExamsPage() {
  const [sessionExam, setSessionExam]   = useState<Exam | null>(null);
  const [filters, setFilters]           = useState<Filters>({ category: "All Exams", access: "All", difficulty: "Any Level" });
  const [search, setSearch]             = useState<string>("");
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [selectedExamRef, setSelectedExamRef] = useState<string | null>(null);
  const [page, setPage]                 = useState(1);

  const { data: listResponse, isLoading: listLoading, isFetching } = useGetPracticeExamList(page);
  const { data: detailResponse, isLoading: detailLoading }         = useGetAvailableExamsDetails(selectedExamRef ?? "");

  const isLoading = selectedExamRef ? detailLoading : listLoading;

  const apiExams = useMemo<Exam[]>(() => {
    if (selectedExamRef) {
      return detailResponse?.data ? [mapToExam(detailResponse.data)] : [];
    }
    return Array.isArray(listResponse?.data) ? listResponse.data.map(mapToExam) : [];
  }, [selectedExamRef, listResponse, detailResponse]);

  const filtered = useMemo<Exam[]>(() => {
    return apiExams.filter(exam => {
      if (filters.access === "Free"    && exam.access !== "free")    return false;
      if (filters.access === "Premium" && exam.access !== "premium") return false;
      if (filters.difficulty !== "Any Level" && exam.difficulty_level !== filters.difficulty.toLowerCase()) return false;
      if (search && !exam.name.toLowerCase().includes(search.toLowerCase()) && !exam.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [apiExams, filters, search]);

  function handlePageChange(newPage: number) {
    setPage(newPage);
    // Scroll back to top of the exam grid smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const clearAll = () => {
    setFilters({ category: "All Exams", access: "All", difficulty: "Any Level" });
    setSearch("");
    setPage(1);
  };

  const hasActiveFilters =
    filters.category !== "All Exams" || filters.access !== "All" ||
    filters.difficulty !== "Any Level" || !!search;

  const totalCount    = listResponse?.count    ?? 0;
  const hasNext       = !!listResponse?.next;
  const hasPrev       = !!listResponse?.previous;
  // Use actual items returned per page — server may ignore the requested page_size
  const actualPageSize = listResponse?.data?.length || PAGE_SIZE;

  return (
    <div className="bg-white font-inter min-h-screen">
      <DashboardHeader />

      <div className="max-w-400 mx-auto px-4 sm:px-6 py-6">
        <ContinueBanner />

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
              <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
              <div className="relative bg-white w-72 max-w-[85vw] h-full overflow-y-auto p-4 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-slate-800">Filters</p>
                  <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
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
            <div className="flex flex-wrap flex-row sm:items-center justify-between mb-5 gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">All Practice Exams</h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  {totalCount > 0
                    ? `${totalCount} exams available for your account`
                    : `${filtered.length} exams available for your account`}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 text-sm font-semibold px-3 py-2.5 rounded-[10px] border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
                >
                  <SlidersHorizontal size={15} />
                  Filters
                  {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                </button>
                <div className="flex-1 sm:flex-none">
                  <DebounceInput
                    onChange={(e) => { setSearch(e); setPage(1); }}
                    value={search}
                    placeHolder="Search for exams..."
                    className="bg-transparent w-full"
                    containerClassName="w-full sm:min-w-[200px] lg:min-w-[270px]"
                    iconPosition="left"
                  />
                </div>
              </div>
            </div>

            <button className="sm:hidden w-full bg-[#4E49F6] hover:bg-indigo-700 text-white font-medium text-sm px-5 py-3 rounded-[10px] transition-all shadow-sm mb-4">
              Start an exam
            </button>

            <FreeAccountBanner />

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4 items-center">
                {filters.category !== "All Exams"  && <Chip label={filters.category}  onRemove={() => setFilters(f => ({ ...f, category: "All Exams" }))} />}
                {filters.access !== "All"          && <Chip label={filters.access}    onRemove={() => setFilters(f => ({ ...f, access: "All" }))} />}
                {filters.difficulty !== "Any Level" && <Chip label={filters.difficulty} onRemove={() => setFilters(f => ({ ...f, difficulty: "Any Level" }))} />}
                {search && <Chip label={`"${search}"`} onRemove={() => setSearch("")} />}
                <button onClick={clearAll} className="text-xs text-slate-400 hover:text-slate-600 underline">Clear all</button>
              </div>
            )}

            {/* Exam grid */}
            {isLoading ? (
              <SkeletonGrid />
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-slate-600 font-semibold">No exams match your filters</p>
                <p className="text-slate-400 text-sm mt-1">Try adjusting the filters or search term</p>
              </div>
            ) : (
              <>
                {/* Dim grid while fetching next page (keeps content visible) */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 transition-opacity duration-200 ${isFetching && !isLoading ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
                  {filtered.map(exam => (
                    <ExamCard
                      key={exam.id}
                      exam={exam}
                      isPremiumLocked={exam.access === "premium"}
                      onStart={() => setSessionExam(exam)}
                    />
                  ))}
                </div>

                {/* Pagination — only for full list, not when a single exam is selected */}
                {!selectedExamRef && (
                 <Pagination
  page={page}
  totalCount={totalCount}
  pageSize={PAGE_SIZE}          // ← no more actualPageSize guess
  hasNext={hasNext}
  hasPrev={hasPrev}
  onChange={handlePageChange}
  isLoading={isFetching}
/>
                )}
              </>
            )}

            <div className="mt-6">
              <UnlockSectionBanner />
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        className="fixed bottom-6 right-6 flex items-center gap-2 text-white text-sm font-bold px-4 sm:px-5 py-3 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 z-40"
        style={{ background: "linear-gradient(135deg, #6366F1, #7C3AED)" }}
      >
        ＋ <span className="hidden sm:inline">AI Practice Generator</span>
        <span className="sm:hidden">AI</span>
      </button>

      {sessionExam && (
        <SessionSetupModal
          examName={sessionExam.name}
          examDesc={sessionExam.description}
          open={sessionExam}
          onClose={() => setSessionExam(null)}
        />
      )}
    </div>
  );
}