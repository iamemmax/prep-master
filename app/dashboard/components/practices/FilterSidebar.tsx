import { Filters } from "../../practice/page";
import SidebarBtn from "./SidebarBtn";
import { useGetPracticeExamList } from "../../util/apis/practice/examsList";

interface ProgressBarEntry {
  label: string;
  pct: number;
  color: string;
}

interface FilterSidebarProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onExamSelect?: (ref: string | null) => void;
  selectedExamRef?: string | null;
}

const ACCESS_OPTIONS: string[] = ["All", "Free", "Premium"];
const DIFFICULTY_OPTIONS: string[] = ["Any Level", "Easy", "Medium", "Hard"];

const MY_PROGRESS: ProgressBarEntry[] = [
  { label: "SAT", pct: 72, color: "#6366F1" },
  { label: "GRE", pct: 45, color: "#3B82F6" },
  { label: "LSAT", pct: 12, color: "#8B5CF6" },
];

function SidebarGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-5 mb-1 px-2">
      {children}
    </p>
  );
}

const FilterSidebar = ({ filters, setFilters, onExamSelect }: FilterSidebarProps) => {
  const { category, access, difficulty } = filters;
  const { data: response, isLoading } = useGetPracticeExamList();

  const rawList = Array.isArray(response?.data) ? response.data : [];

  const set = (key: keyof Filters) => (v: string) =>
    setFilters(f => ({ ...f, [key]: v }));

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
          active={category === "All Exams"}
          onClick={() => { set("category")("All Exams"); onExamSelect?.(null); }}
        />

        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 mx-2 rounded-lg bg-slate-100 dark:bg-zinc-800 animate-pulse" />
          ))
        ) : (
          rawList.map((exam) => (
            <div key={exam.reference}>
              {/* Exam name button */}
              <SidebarBtn
                label={exam.name}
                active={category === exam.name}
                onClick={() => { set("category")(exam.name); onExamSelect?.(exam.reference); }}
              />

              {/* Subjects indented below */}
              {exam.subjects?.length > 0 && (
                <div className="mt-0.5 space-y-0.5">
                  {exam.subjects.map((subject) => (
                    <SidebarBtn
                      key={subject.reference}
                      label={subject.name}
                      active={category === subject.name}
                      onClick={() => { set("category")(subject.name); onExamSelect?.(subject.reference); }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <SidebarGroupLabel>Access</SidebarGroupLabel>
      <div className="space-y-1">
        {ACCESS_OPTIONS.map(opt => (
          <SidebarBtn key={opt} label={opt} active={access === opt} onClick={() => set("access")(opt)} />
        ))}
      </div>

      <SidebarGroupLabel>Difficulty</SidebarGroupLabel>
      <div className="space-y-1">
        {DIFFICULTY_OPTIONS.map(opt => (
          <SidebarBtn key={opt} label={opt} active={difficulty === opt} onClick={() => set("difficulty")(opt)} />
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800">
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
      </div>
    </aside>
  );
};

export default FilterSidebar;