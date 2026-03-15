"use client";
import { useState, useMemo } from "react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import ExamCard from "../components/practices/ExamCard";
import FilterSidebar from "../components/practices/FilterSidebar";
import FreeAccountBanner from "../components/practices/FreeAccountBanner";
import DebounceInput from "../util/shared/DebounceInput";
import UnlockSectionBanner from "../components/practices/UnlockSection";
import SessionSetupModal from "../components/practices/StartSessionModal";
import { X, SlidersHorizontal } from "lucide-react";

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
}

export interface Filters {
  category: string;
  access: string;
  difficulty: string;
}

interface ChipProps {
  label: string;
  onRemove: () => void;
}

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

const EXAMS: Exam[] = [
  { id: 1, name: "SAT", description: "Standardized Test for College Admissions", questions: 3200, topics: 4, difficulty: "Medium", freeAccess: 50, lastScore: 75, progress: 75, badge: "Most Popular", category: "SAT", access: "free", difficulty_level: "medium", started: true },
  { id: 2, name: "GRE", description: "Graduate Record Examination", questions: 5200, topics: 6, difficulty: "Hard", freeAccess: 50, lastScore: 45, progress: 45, badge: "Top Rated", category: "GRE", access: "free", difficulty_level: "hard", started: true },
  { id: 3, name: "GMAT", description: "Graduate Management Admission Test", questions: 3200, topics: 4, difficulty: "Hard", freeAccess: 50, lastScore: null, progress: 0, badge: "Premium", category: "GMAT", access: "premium", difficulty_level: "hard", started: false },
  { id: 4, name: "PMP", description: "Project Management Professional", questions: 7800, topics: 6, difficulty: "Hard", freeAccess: 50, lastScore: null, progress: 0, badge: null, category: "PMP", access: "free", difficulty_level: "hard", started: false },
  { id: 5, name: "CPA", description: "Certified Public Accountant", questions: 7800, topics: 6, difficulty: "Hard", freeAccess: 50, lastScore: null, progress: 0, badge: null, category: "CPA", access: "free", difficulty_level: "hard", started: false },
  { id: 6, name: "LSAT", description: "Law School Admission Test", questions: 7800, topics: 6, difficulty: "Hard", freeAccess: 50, lastScore: null, progress: 0, badge: null, category: "LSAT", access: "free", difficulty_level: "hard", started: false },
  { id: 7, name: "CIS", description: "Certified Information Systems", questions: 7800, topics: 6, difficulty: "Medium", freeAccess: 50, lastScore: null, progress: 0, badge: null, category: "CIS", access: "free", difficulty_level: "medium", started: false },
  { id: 8, name: "ICAN", description: "Institute of Chartered Accountants", questions: 7800, topics: 6, difficulty: "Easy", freeAccess: 50, lastScore: null, progress: 0, badge: null, category: "ICAN", access: "free", difficulty_level: "easy", started: false },
];

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

export default function PracticeExamsPage() {
  const [sessionExam, setSessionExam] = useState<Exam | null>(null);
  const [filters, setFilters] = useState<Filters>({ category: "All Exams", access: "All", difficulty: "Any Level" });
  const [search, setSearch] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = useMemo<Exam[]>(() => {
    return EXAMS.filter(exam => {
      if (filters.category !== "All Exams" && exam.category !== filters.category) return false;
      if (filters.access === "Free" && exam.access !== "free") return false;
      if (filters.access === "Premium" && exam.access !== "premium") return false;
      if (filters.difficulty !== "Any Level" && exam.difficulty_level !== filters.difficulty.toLowerCase()) return false;
      if (search && !exam.name.toLowerCase().includes(search.toLowerCase()) && !exam.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [filters, search]);

  const clearAll = () => { setFilters({ category: "All Exams", access: "All", difficulty: "Any Level" }); setSearch(""); };

  const hasActiveFilters =
    filters.category !== "All Exams" || filters.access !== "All" ||
    filters.difficulty !== "Any Level" || !!search;

  return (
    <div className="bg-white font-inter min-h-screen">
      <DashboardHeader />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <ContinueBanner />

        <div className="flex gap-6 items-start">

          {/* ── Desktop Sidebar ── */}
          <div className="hidden lg:block self-start sticky top-6 shrink-0">
            <div className="max-h-[calc(100vh-3rem)] overflow-y-auto">
              <FilterSidebar filters={filters} setFilters={setFilters} />
            </div>
          </div>

          {/* ── Mobile Sidebar Drawer ── */}
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
                <FilterSidebar filters={filters} setFilters={setFilters} />
              </div>
            </div>
          )}

          {/* ── Main ── */}
          <div className="flex-1 min-w-0">

            {/* Header row */}
            <div className="flex flex-wrap flex-row sm:items-center justify-between mb-5 gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">All Practice Exams</h1>
                <p className="text-sm text-slate-400 mt-0.5">{filtered.length} exams available for your account</p>
              </div>
              <div className="flex items-center  gap-2 sm:gap-3">
                {/* Mobile filter button */}
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
                    onChange={(e) => setSearch(e)}
                    value={search}
                    placeHolder="Search for exams..."
                    className="bg-transparent w-full"
                    containerClassName="w-full sm:min-w-[200px] lg:min-w-[270px]"
                    iconPosition="left"
                  />
                </div>
                <button className="hidden sm:block bg-[#4E49F6] hover:bg-indigo-700 text-white font-medium text-sm px-5 py-3 cursor-pointer rounded-[10px] transition-all shadow-sm hover:shadow-md whitespace-nowrap shrink-0">
                  Start an exam
                </button>
              </div>
            </div>

            {/* Mobile start exam button */}
            <button className="sm:hidden w-full bg-[#4E49F6] hover:bg-indigo-700 text-white font-medium text-sm px-5 py-3 rounded-[10px] transition-all shadow-sm mb-4">
              Start an exam
            </button>

            <FreeAccountBanner />

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4 items-center">
                {filters.category !== "All Exams" && <Chip label={filters.category} onRemove={() => setFilters(f => ({ ...f, category: "All Exams" }))} />}
                {filters.access !== "All" && <Chip label={filters.access} onRemove={() => setFilters(f => ({ ...f, access: "All" }))} />}
                {filters.difficulty !== "Any Level" && <Chip label={filters.difficulty} onRemove={() => setFilters(f => ({ ...f, difficulty: "Any Level" }))} />}
                {search && <Chip label={`"${search}"`} onRemove={() => setSearch("")} />}
                <button onClick={clearAll} className="text-xs text-slate-400 hover:text-slate-600 underline">Clear all</button>
              </div>
            )}

            {/* Exam grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-slate-600 font-semibold">No exams match your filters</p>
                <p className="text-slate-400 text-sm mt-1">Try adjusting the filters or search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(exam => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    isPremiumLocked={exam.access === "premium"}
                    onStart={() => setSessionExam(exam)}
                  />
                ))}
              </div>
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