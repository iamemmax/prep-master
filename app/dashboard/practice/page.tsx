"use client";
import { useState, useMemo } from "react";
import DashboardHeader from "../components/dashboard/DashboardHeader";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Exam {
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
  badgeColor?: string;
  category: string;
  access: "free" | "premium";
  difficulty_level: "easy" | "medium" | "hard";
  started: boolean;
}

interface Filters {
  category: string;
  access: string;
  difficulty: string;
}

interface FilterSidebarProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

interface ExamCardProps {
  exam: Exam;
  isPremiumLocked: boolean;
}

interface ChipProps {
  label: string;
  onRemove: () => void;
}

interface ProgressBarEntry {
  label: string;
  pct: number;
  color: string;
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const EXAMS: Exam[] = [
  {
    id: 1, name: "SAT", description: "Standardized Test for College Admissions",
    questions: 3200, topics: 4, difficulty: "Medium", freeAccess: 50,
    lastScore: 75, progress: 75, badge: "Most Popular", badgeColor: "#EF4444",
    category: "SAT", access: "free", difficulty_level: "medium", started: true,
  },
  {
    id: 2, name: "GRE", description: "Graduate Record Examination",
    questions: 5200, topics: 6, difficulty: "Hard", freeAccess: 50,
    lastScore: 45, progress: 45, badge: "Top Rated", badgeColor: "#3B82F6",
    category: "GRE", access: "free", difficulty_level: "hard", started: true,
  },
  {
    id: 3, name: "GMAT", description: "Graduate Management Admission Test",
    questions: 3200, topics: 4, difficulty: "Hard", freeAccess: 50,
    lastScore: null, progress: 0, badge: "Premium", badgeColor: "#F59E0B",
    category: "GMAT", access: "premium", difficulty_level: "hard", started: false,
  },
  {
    id: 4, name: "PMP", description: "Project Management Professional",
    questions: 7800, topics: 6, difficulty: "Hard", freeAccess: 50,
    lastScore: null, progress: 0, badge: null,
    category: "PMP", access: "free", difficulty_level: "hard", started: false,
  },
  {
    id: 5, name: "CPA", description: "Certified Public Accountant",
    questions: 7800, topics: 6, difficulty: "Hard", freeAccess: 50,
    lastScore: null, progress: 0, badge: null,
    category: "CPA", access: "free", difficulty_level: "hard", started: false,
  },
  {
    id: 6, name: "LSAT", description: "Law School Admission Test",
    questions: 7800, topics: 6, difficulty: "Hard", freeAccess: 50,
    lastScore: null, progress: 0, badge: null,
    category: "LSAT", access: "free", difficulty_level: "hard", started: false,
  },
  {
    id: 7, name: "CIS", description: "Certified Information Systems",
    questions: 7800, topics: 6, difficulty: "Medium", freeAccess: 50,
    lastScore: null, progress: 0, badge: null,
    category: "CIS", access: "free", difficulty_level: "medium", started: false,
  },
  {
    id: 8, name: "ICAN", description: "Institute of Chartered Accountants",
    questions: 7800, topics: 6, difficulty: "Easy", freeAccess: 50,
    lastScore: null, progress: 0, badge: null,
    category: "ICAN", access: "free", difficulty_level: "easy", started: false,
  },
];

const EXAM_CATEGORIES: string[] = ["All Exams", "SAT", "GRE", "GMAT", "LSAT", "CPA", "PMP"];
const ACCESS_OPTIONS: string[]   = ["All", "Free", "Premium"];
const DIFFICULTY_OPTIONS: string[] = ["Any Level", "Easy", "Medium", "Hard"];

const MY_PROGRESS: ProgressBarEntry[] = [
  { label: "SAT",  pct: 72, color: "#6366F1" },
  { label: "GRE",  pct: 45, color: "#3B82F6" },
  { label: "LSAT", pct: 12, color: "#8B5CF6" },
];

// ─── SIDEBAR SUB-COMPONENTS — module scope ───────────────────────────────────

function SidebarGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-5 mb-1 px-2">
      {children}
    </p>
  );
}

function SidebarBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
        active
          ? "bg-indigo-100 text-indigo-700 font-semibold"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-normal"
      }`}
    >
      {label}
    </button>
  );
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function ContinueBanner() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl mb-6"
      style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 60%, #A78BFA 100%)" }}
    >
      <div className="relative flex items-center justify-between px-8 py-6 gap-4">
        <div className="flex-1">
          <p className="text-white font-bold text-xl leading-tight mb-1">
            Continue your SAT practice
          </p>
          <p className="text-purple-200 text-sm">
            You&apos;re 72% through ·{" "}
            <strong className="text-white font-bold">883 questions remaining</strong> · Last score:{" "}
            <strong className="text-white font-bold">85%</strong>
          </p>
          <div className="mt-3 h-2 rounded-full bg-white/25 w-56 overflow-hidden">
            <div className="h-full rounded-full bg-white" style={{ width: "72%" }} />
          </div>
        </div>
        <button className="shrink-0 bg-white text-indigo-700 font-bold text-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
          Continue →
        </button>
      </div>
    </div>
  );
}

function FilterSidebar({ filters, setFilters }: FilterSidebarProps) {
  const { category, access, difficulty } = filters;
  const set = (key: keyof Filters) => (v: string) =>
    setFilters(f => ({ ...f, [key]: v }));

  return (
    <aside className="w-56 shrink-0 pt-1">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">
        FILTER
      </p>

      <SidebarGroupLabel>Exam</SidebarGroupLabel>
      <div className="space-y-0.5">
        {EXAM_CATEGORIES.map(cat => (
          <SidebarBtn
            key={cat}
            label={cat}
            active={category === cat}
            onClick={() => set("category")(cat)}
          />
        ))}
      </div>

      <SidebarGroupLabel>Access</SidebarGroupLabel>
      <div className="space-y-0.5">
        {ACCESS_OPTIONS.map(opt => (
          <SidebarBtn
            key={opt}
            label={opt}
            active={access === opt}
            onClick={() => set("access")(opt)}
          />
        ))}
      </div>

      <SidebarGroupLabel>Difficulty</SidebarGroupLabel>
      <div className="space-y-0.5">
        {DIFFICULTY_OPTIONS.map(opt => (
          <SidebarBtn
            key={opt}
            label={opt}
            active={difficulty === opt}
            onClick={() => set("difficulty")(opt)}
          />
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">
          My Progress
        </p>
        {MY_PROGRESS.map(({ label, pct, color }) => (
          <div key={label} className="mb-3 px-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">{label}</span>
              <span className="text-slate-400">{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function ExamCard({ exam, isPremiumLocked }: ExamCardProps) {
  const btnLabel = isPremiumLocked
    ? "Upgrade to Access"
    : exam.started
    ? "Continue Practice"
    : "Start Practice";

  const btnStyle: React.CSSProperties = isPremiumLocked
    ? { background: "linear-gradient(135deg, #F59E0B, #EF4444)" }
    : exam.started
    ? { background: "linear-gradient(135deg, #6366F1, #7C3AED)" }
    : { background: "#fff", color: "#6366F1", border: "1.5px solid #6366F1" };

  return (
    <div className={`bg-white rounded-xl border p-4 flex flex-col gap-3 ${
      isPremiumLocked ? "border-amber-200" : "border-slate-200"
    }`}>

      {/* Name + badge + description */}
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="text-sm font-bold text-slate-900">{exam.name}</h3>
          {exam.badge && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shrink-0"
              style={{ background: exam.badgeColor }}
            >
              {exam.badge}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 leading-snug">{exam.description}</p>
      </div>

      {/* Stats — 4 cols */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { value: exam.questions.toLocaleString(), label: "Questions"  },
          { value: exam.topics,                     label: "Topics"     },
          { value: exam.difficulty,                 label: "Difficulty" },
          { value: exam.freeAccess,                 label: "Free access"},
        ].map(({ value, label }) => (
          <div key={label}>
            <p className="text-sm font-bold text-slate-800 leading-none">{value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Progress / status */}
      <div className="flex-1">
        {exam.started && !isPremiumLocked ? (
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Your progress</span>
              <span className="font-semibold text-slate-600">{exam.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${exam.progress}%`, background: "linear-gradient(90deg, #6366F1, #7C3AED)" }}
              />
            </div>
            {exam.lastScore !== null && (
              <p className="text-[10px] text-slate-400 mt-1">
                Last score: <span className="font-semibold text-slate-600">{exam.lastScore}%</span>
              </p>
            )}
          </div>
        ) : isPremiumLocked ? (
          <p className="text-[10px] text-amber-600 font-medium">
            🔒 Premium — upgrade to unlock all questions
          </p>
        ) : (
          <p className="text-[10px] text-slate-400">
            Not started · {exam.freeAccess} free questions ready
          </p>
        )}
      </div>

      {/* CTA */}
      <button
        className="w-full py-2.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
        style={btnStyle}
      >
        {btnLabel}
      </button>
    </div>
  );
}

function FreeAccountBanner() {
  return (
    <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 mb-6">
      <span className="text-indigo-500 shrink-0">ℹ️</span>
      <p className="text-sm text-slate-700">
        <strong>Free Account:</strong> You have access to 50 questions per exam.{" "}
        <button className="text-indigo-600 underline font-semibold hover:text-indigo-800">
          Upgrade to Premium
        </button>{" "}
        for unlimited access to all 17,000 questions.
      </p>
    </div>
  );
}

function Chip({ label, onRemove }: ChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-200">
      {label}
      <button onClick={onRemove} className="text-indigo-400 hover:text-indigo-700 font-bold">
        ×
      </button>
    </span>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function PracticeExamsPage() {
  const [filters, setFilters] = useState<Filters>({
    category: "All Exams",
    access: "All",
    difficulty: "Any Level",
  });
  const [search, setSearch] = useState<string>("");

  const filtered = useMemo<Exam[]>(() => {
    return EXAMS.filter(exam => {
      if (filters.category !== "All Exams" && exam.category !== filters.category) return false;
      if (filters.access === "Free"    && exam.access !== "free")    return false;
      if (filters.access === "Premium" && exam.access !== "premium") return false;
      if (
        filters.difficulty !== "Any Level" &&
        exam.difficulty_level !== filters.difficulty.toLowerCase()
      ) return false;
      if (
        search &&
        !exam.name.toLowerCase().includes(search.toLowerCase()) &&
        !exam.description.toLowerCase().includes(search.toLowerCase())
      ) return false;
      return true;
    });
  }, [filters, search]);

  const clearAll = () => {
    setFilters({ category: "All Exams", access: "All", difficulty: "Any Level" });
    setSearch("");
  };

  const hasActiveFilters =
    filters.category !== "All Exams" ||
    filters.access    !== "All"       ||
    filters.difficulty !== "Any Level" ||
    !!search;

  return (
    <div className="min-h-screen bg-white font-inter" >
        <DashboardHeader/>
         <div className="max-w-400 mx-auto max-2xl:px-6 py-6">
        <ContinueBanner />

        <div className="flex gap-6 items-start">
          {/* Sidebar */}
          <div className="hidden lg:block">

          <FilterSidebar filters={filters} setFilters={setFilters} />
          </div>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-start flex-wrap justify-between mb-5 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">All Practice Exams</h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  {filtered.length} exams available for your account
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search for exams..."
                    value={search}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all w-56"
                  />
                </div>
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                >
                  Start an exam
                </button>
              </div>
            </div>

            <FreeAccountBanner />

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4 items-center">
                {filters.category !== "All Exams" && (
                  <Chip label={filters.category} onRemove={() => setFilters(f => ({ ...f, category: "All Exams" }))} />
                )}
                {filters.access !== "All" && (
                  <Chip label={filters.access} onRemove={() => setFilters(f => ({ ...f, access: "All" }))} />
                )}
                {filters.difficulty !== "Any Level" && (
                  <Chip label={filters.difficulty} onRemove={() => setFilters(f => ({ ...f, difficulty: "Any Level" }))} />
                )}
                {search && <Chip label={`"${search}"`} onRemove={() => setSearch("")} />}
                <button onClick={clearAll} className="text-xs text-slate-400 hover:text-slate-600 underline">
                  Clear all
                </button>
              </div>
            )}

            {/* Exam list — full-width stacked cards */}
            {filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-slate-600 font-semibold">No exams match your filters</p>
                <p className="text-slate-400 text-sm mt-1">Try adjusting the filters or search term</p>
              </div>
            ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
             
             >
  {filtered.map(exam => (
    <ExamCard key={exam.id} exam={exam} isPremiumLocked={exam.access === "premium"} />
  ))}
</div>
            )}
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        className="fixed bottom-6 right-6 flex items-center gap-2 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 z-50"
        style={{ background: "linear-gradient(135deg, #6366F1, #7C3AED)" }}
      >
        ＋ AI Practice Generator
      </button>
    </div>
  );
}