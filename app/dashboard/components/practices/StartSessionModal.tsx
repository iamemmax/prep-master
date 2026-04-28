import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm, Controller,useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Exam } from "../../practice/page";
import { useStartPracticeExam } from "../../util/apis/practice/createPracticeExam";
import { useGetAvailableExamsDetails } from "../../util/apis/practice/availableExamsDetails";
import { useErrorModalState } from "@/hooks";
import { formatAxiosErrorMessage } from "@/utils";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { ErrorModal } from "@/components/ui/ErrorModal";
import { SmallSpinner } from "@/components/ui/Spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { ShieldCheck, BookOpen, X } from "lucide-react";
import { clearProctorReports } from "../../util/proctor/report";

// ─── Schema ──────────────────────────────────────────────────────────────────
const sessionSchema = z.object({
  exam_config_id:                   z.number({ message: "Exam type is required" }),
  number_of_questions:            z.number({ message: "Number of questions is required" }).min(1, "At least 1 question").max(2700, "Max 2,700 questions"),
  session_mode:                   z.enum(["timed", "untimed", "topic-focus"], { message: "Session mode is required" }),
  difficulty_level:               z.enum(["mixed", "easy", "medium", "hard"], { message: "Difficulty is required" }),
  time_limit_minutes:             z.number().min(1, "At least 1 minute").nullable().optional(),
  subjects_selected:              z.array(z.number()).default([]),   // subject ids picked from the exam
  topics_selected:                z.array(z.number()).default([]),   // ← removed .optional()
  show_explanation_after_answer:  z.boolean().default(false),
  enable_proctoring:              z.boolean().default(false),
}).refine(data => {
  if (data.session_mode === "timed") {
    return data.time_limit_minutes != null && data.time_limit_minutes > 0;
  }
  return true;
}, { message: "Time limit is required for timed sessions", path: ["time_limit_minutes"] });

export type SessionFormData = z.output<typeof sessionSchema>;

// ─── Constants ────────────────────────────────────────────────────────────────
const DIFFICULTIES = [
  // { label: "Mixed",  value: "mixed"  },
  { label: "Easy",   value: "easy"   },
  { label: "Medium", value: "medium" },
  { label: "Hard",   value: "hard"   },
] as const;

const QUESTION_PRESETS = [10, 20, 30, 50];

const TIME_PRESETS = [
  { label: "10 mins",    value: 10  },
  { label: "20 mins",    value: 20  },
  { label: "30 mins",    value: 30  },
  { label: "45 mins",    value: 45  },
  { label: "1 hr",       value: 60  },
  { label: "1hr 30mins", value: 90  },
];

const SESSION_MODES = [
  { key: "timed",       label: "Timed",       sub: "Simulate real exam conditions" },
  { key: "untimed",     label: "Untimed",     sub: "Learn at your own pace"         },
  { key: "topic-focus", label: "Topic Focus", sub: "Master specific area"           },
] as const;

// ─── Component ───────────────────────────────────────────────────────────────
export default function SessionSetupModal({ onClose, examName = "SAT", examDesc = "Standardized Test for College Admissions", open, preselectedSubject = null, }: {
  onClose?: () => void;
  examName?: string;
  examDesc?: string;
  open: Exam | null;
  /** When set, the modal pre-selects this subject and hides the subject-picker section. */
  preselectedSubject?: { id: number; name: string } | null;
  onSubmit?: (data: SessionFormData) => void;
}) {

     const {
        isErrorModalOpen,
        setErrorModalState,
        openErrorModalWithMessage,
        errorModalMessage,
      } = useErrorModalState();
const {
  control,
  handleSubmit,
  setValue,
  formState: { errors },
} = useForm<z.input<typeof sessionSchema>, unknown, z.output<typeof sessionSchema>>({
  resolver: zodResolver(sessionSchema),
  defaultValues: {
    exam_config_id:                  open?.examConfigId ?? open?.id ?? 1,
    number_of_questions:           30,
    session_mode:                  "timed",
    difficulty_level:              "easy",
    time_limit_minutes:            45,
    subjects_selected:             preselectedSubject ? [preselectedSubject.id] : [],
    topics_selected:               [],
    show_explanation_after_answer: false,
    enable_proctoring:             false,
  },
});
const router = useRouter()
// Subjects toggle — OFF means "all subjects". When a preselected subject is
// passed in we force the toggle ON and hide the picker entirely.
const [useSubjects, setUseSubjects] = useState(!!preselectedSubject);
const { data: examDetails, isLoading: loadingSubjects } =
  useGetAvailableExamsDetails(open?.id ? String(open.id) : "");
const availableSubjects = examDetails?.data?.subjects ?? [];

const {mutate:handleStart,isPending} = useStartPracticeExam()
const onSubmit = (data: z.output<typeof sessionSchema>) => {
  // Enter browser fullscreen synchronously on the user's click so the gesture
  // requirement of the Fullscreen API is satisfied. Silently no-ops on
  // platforms that don't support element fullscreen (iOS Safari).
  if (typeof document !== "undefined" && !document.fullscreenElement) {
    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    };
    const req = el.requestFullscreen ?? el.webkitRequestFullscreen;
    req?.call(el).catch(() => { /* denied or unsupported */ });
  }
  handleStart(data,{
    onSuccess:(res)=>{
       if (typeof window !== "undefined") {
         // Runtime marker read by Calculator + start-practice page
         sessionStorage.setItem("prep:proctoring", data.enable_proctoring ? "on" : "off");
         // New practice → wipe any prior proctoring reports from this device.
         clearProctorReports();
       }
       router.push(`/dashboard/practice/start-practice/${res?.data?.session?.id ?? res?.data?.id}`)
    },
// eslint-disable-next-line @typescript-eslint/no-explicit-any
onError: (error: any) => {
  const errorMessage = 
    error?.response?.data?.data?.non_field_errors?.[0]
    || error?.response?.data?.message
    || formatAxiosErrorMessage(error as AxiosError)
    || 'An error occurred. Please try again.';
  openErrorModalWithMessage(String(errorMessage));
}
    })
  }



const sessionMode   = useWatch({ control, name: "session_mode" });
const numQuestions  = useWatch({ control, name: "number_of_questions" });
const timeLimitMins = useWatch({ control, name: "time_limit_minutes" });
const diffLevel     = useWatch({ control, name: "difficulty_level" });
const subjectsVal   = (useWatch({ control, name: "subjects_selected" }) ?? []) as number[];

// Flipping the toggle off should wipe any previously-picked subjects so the
// backend receives [] (interpreted as "all subjects"). When a subject is
// preselected we leave it alone — toggle is forced on and the picker is hidden.
useEffect(() => {
  if (preselectedSubject) return;
  if (!useSubjects) {
    setValue("subjects_selected", []);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [useSubjects]);

// Turning the toggle ON auto-selects every subject in the exam, so the user
// starts with "all subjects of this exam" instead of an empty list.
useEffect(() => {
  if (preselectedSubject) return;
  if (!useSubjects) return;
  if (availableSubjects.length === 0) return;
  if (subjectsVal.length > 0) return;
  setValue("subjects_selected", availableSubjects.map((s) => s.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [useSubjects, availableSubjects]);

const subjectsBlocked = useSubjects && subjectsVal.length === 0;


  return (

    <>
    <Dialog open={open !== null} >
      <DialogContent
        className="bg-white dark:bg-zinc-900 border-none p-0 z-30 text-slate-900 dark:text-zinc-100"
        style={{ maxWidth: 520, zIndex: 9999 }}
        showCloseButton={false}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[90vh]">

          {/* header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">{examName} — Session Setup</h2>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{examDesc}</p>
            </div>
            <button type="button" onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors mt-0.5">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* scrollable body */}
          <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">Difficulty</label>
              <Controller
                name="difficulty_level"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-1.5">
                    {DIFFICULTIES.map(d => (
                      <button
                        type="button"
                        key={d.value}
                        onClick={() => field.onChange(d.value)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                          field.value === d.value
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-indigo-300 hover:text-indigo-600"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.difficulty_level && <p className="text-[10px] text-red-500 mt-1">{errors.difficulty_level.message}</p>}
            </div>

            {/* Locked-in subject indicator — shown when a single subject was
                picked from the user's exams in the sidebar */}
            {preselectedSubject && (
              <div className="flex items-center gap-2 rounded-xl border border-indigo-300 bg-indigo-50/50 dark:border-indigo-500/40 dark:bg-indigo-500/5 p-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-indigo-100 dark:bg-indigo-500/20">
                  <BookOpen size={14} className="text-indigo-600 dark:text-indigo-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 leading-tight">
                    Practicing: <span className="text-indigo-700 dark:text-indigo-300">{preselectedSubject.name}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 leading-snug mt-0.5">
                    This subject was picked from your exams
                  </p>
                </div>
              </div>
            )}

            {/* Specific subjects toggle + multi-select — hidden when a single subject is preselected */}
            {!preselectedSubject && (
            <div className={`rounded-xl border p-3 transition-all ${useSubjects ? "border-indigo-300 bg-indigo-50/50 dark:border-indigo-500/40 dark:bg-indigo-500/5" : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-2 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${useSubjects ? "bg-indigo-100 dark:bg-indigo-500/20" : "bg-slate-100 dark:bg-zinc-800"}`}>
                    <BookOpen size={14} className={useSubjects ? "text-indigo-600 dark:text-indigo-300" : "text-slate-400"} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 leading-tight">Practice specific subjects</p>
                    <p className="text-[10px] text-slate-400 leading-snug mt-0.5">
                      Pick one or more subjects from this exam
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUseSubjects(s => !s)}
                  className={`relative rounded-full transition-colors duration-200 shrink-0 ml-2 ${useSubjects ? "bg-indigo-600" : "bg-slate-200 dark:bg-zinc-700"}`}
                  style={{ width: 40, height: 22 }}
                  aria-pressed={useSubjects}
                >
                  <div className={`absolute top-0.75 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${useSubjects ? "left-5.5" : "left-0.75"}`} />
                </button>
              </div>

              {useSubjects && (
                <div className="mt-3 pt-3 border-t border-indigo-200/60 dark:border-indigo-500/20">
                  {loadingSubjects ? (
                    <div className="flex gap-1.5 flex-wrap">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className="h-7 w-20 rounded-full bg-slate-100 dark:bg-zinc-800 animate-pulse" />
                      ))}
                    </div>
                  ) : availableSubjects.length === 0 ? (
                    <p className="text-[11px] italic text-slate-400 dark:text-zinc-500">No subjects available for this exam.</p>
                  ) : (
                    <Controller
                      name="subjects_selected"
                      control={control}
                      render={({ field }) => {
                        const selectedIds = (field.value ?? []) as number[];
                        const selectedSet = new Set(selectedIds);
                        const remaining = availableSubjects.filter(s => !selectedSet.has(s.id));
                        const allOn = remaining.length === 0;

                        return (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 tabular-nums">
                                {selectedIds.length} of {availableSubjects.length} selected
                              </p>
                              <button
                                type="button"
                                onClick={() => field.onChange(allOn ? [] : availableSubjects.map(s => s.id))}
                                className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-300 hover:underline"
                              >
                                {allOn ? "Clear all" : "Select all"}
                              </button>
                            </div>

                            {/* Dropdown — pick a subject from the exam to add it */}
                            <Select
                              value=""
                              onValueChange={(v) => {
                                const id = Number(v);
                                if (!id || selectedSet.has(id)) return;
                                field.onChange([...selectedIds, id]);
                              }}
                              disabled={allOn}
                            >
                              <SelectTrigger className="h-9 w-full bg-white dark:bg-zinc-900 dark:text-white text-xs">
                                <SelectValue placeholder={allOn ? "All subjects added" : "Add a subject"} />
                              </SelectTrigger>
                              <SelectContent
                                className="z-10000"
                                position="popper"
                                sideOffset={4}
                              >
                                {remaining.map(s => (
                                  <SelectItem key={s.id} className="text-xs" value={String(s.id)}>{s.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {/* Selected subject chips with delete */}
                            {selectedIds.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {selectedIds.map(id => {
                                  const subj = availableSubjects.find(s => s.id === id);
                                  const label = subj?.name ?? `Subject #${id}`;
                                  return (
                                    <span
                                      key={id}
                                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-indigo-600 text-white border border-indigo-600"
                                    >
                                      {label}
                                      <button
                                        type="button"
                                        onClick={() => field.onChange(selectedIds.filter(x => x !== id))}
                                        className="ml-0.5 text-white/80 hover:text-white"
                                        aria-label={`Remove ${label}`}
                                      >
                                        <X size={11} strokeWidth={3} />
                                      </button>
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        );
                      }}
                    />
                  )}

                  {subjectsBlocked && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2">
                      Pick or type at least one subject, or turn this off to practice all subjects.
                    </p>
                  )}
                </div>
              )}
            </div>
            )}

            {/* Number of Questions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">Number of Questions</label>
              <Controller
                name="number_of_questions"
                control={control}
                render={({ field }) => (
                  <>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {QUESTION_PRESETS.map(q => (
                        <button
                          type="button"
                          key={q}
                          onClick={() => field.onChange(q)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                            field.value === q
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-indigo-300 hover:text-indigo-600"
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => field.onChange(0)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                          !QUESTION_PRESETS.includes(field.value as number)
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-indigo-300 hover:text-indigo-600"
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                    {!QUESTION_PRESETS.includes(field.value as number) && (
                      <input
                        type="number"
                        placeholder="Enter number of questions"
                        value={field.value || ""}
                        onChange={e => field.onChange(Number(e.target.value))}
                        className="w-full h-9 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 text-xs text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 placeholder:text-slate-300 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-400 transition-colors"
                      />
                    )}
                  </>
                )}
              />
              {errors.number_of_questions && <p className="text-[10px] text-red-500 mt-1">{errors.number_of_questions.message}</p>}
              <p className="text-[10px] text-amber-500 font-medium mt-1.5">Free accounts limited to 50 questions per session</p>
            </div>

            {/* Session Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">Session mode</label>
              <Controller
                name="session_mode"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-3 gap-2">
                    {SESSION_MODES.map(m => (
                      <button
                        type="button"
                        key={m.key}
                        onClick={() => field.onChange(m.key)}
                        className={`relative flex flex-col items-start gap-0.5 border rounded-xl p-3 text-left transition-all ${
                          field.value === m.key
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                            : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-indigo-300"
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full border-2 mb-1 flex items-center justify-center ${
                          field.value === m.key ? "border-indigo-600" : "border-slate-300"
                        }`}>
                          {field.value === m.key && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                        </div>
                        <span className={`text-[11px] font-bold leading-tight ${field.value === m.key ? "text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-zinc-200"}`}>
                          {m.label}
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-zinc-500 leading-tight">{m.sub}</span>
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.session_mode && <p className="text-[10px] text-red-500 mt-1">{errors.session_mode.message}</p>}
            </div>

            {/* Time Limit — only for timed */}
            {sessionMode === "timed" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">Set time limit</label>
                <Controller
                  name="time_limit_minutes"
                  control={control}
                  render={({ field }) => (
                    <>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {TIME_PRESETS.map(t => (
                          <button
                            type="button"
                            key={t.value}
                            onClick={() => field.onChange(t.value)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                              field.value === t.value
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-indigo-300 hover:text-indigo-600"
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => field.onChange(null)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                            field.value == null || !TIME_PRESETS.find(t => t.value === field.value)
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-indigo-300 hover:text-indigo-600"
                          }`}
                        >
                          Custom
                        </button>
                      </div>
                      {(field.value == null || !TIME_PRESETS.find(t => t.value === field.value)) && (
                        <input
                          type="number"
                          placeholder="Enter time in minutes"
                          value={field.value ?? ""}
                          onChange={e => field.onChange(Number(e.target.value))}
                          className="w-full h-9 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 text-xs text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 placeholder:text-slate-300 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-400 transition-colors"
                        />
                      )}
                    </>
                  )}
                />
                {errors.time_limit_minutes && <p className="text-[10px] text-red-500 mt-1">{errors.time_limit_minutes.message}</p>}
              </div>
            )}

            {/* Show explanation toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Show explanation after each answer</span>
              <Controller
                name="show_explanation_after_answer"
                control={control}
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className={`relative rounded-full transition-colors duration-200 ${field.value ? "bg-indigo-600" : "bg-slate-200 dark:bg-zinc-700"}`}
                    style={{ width: 40, height: 22 }}
                  >
                    <div className={`absolute top-0.75 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${field.value ? "left-5.5" : "left-0.75"}`} />
                  </button>
                )}
              />
            </div>

            {/* Proctoring */}
            <Controller
              name="enable_proctoring"
              control={control}
              render={({ field }) => {
                const on = !!field.value;
                return (
                  <div className={`rounded-xl border p-3 transition-all ${on ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-500/40 dark:bg-emerald-500/10" : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-2 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${on ? "bg-emerald-100 dark:bg-emerald-500/20" : "bg-slate-100 dark:bg-zinc-800"}`}>
                          <ShieldCheck size={14} className={on ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-zinc-500"} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-700 dark:text-zinc-200 leading-tight">Enable proctoring</p>
                          <p className="text-[10px] text-slate-400 dark:text-white/70 leading-snug mt-0.5">
                            Webcam monitors for phones, second person, and looking away
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => field.onChange(!on)}
                        className={`relative rounded-full transition-colors duration-200 shrink-0 ml-2 ${on ? "bg-emerald-500 dark:bg-emerald-500" : "bg-slate-200 dark:bg-zinc-700"}`}
                        style={{ width: 40, height: 22 }}
                        aria-pressed={on}
                      >
                        <div className={`absolute top-0.75 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${on ? "left-5.5" : "left-0.75"}`} />
                      </button>
                    </div>
                    {on && (
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-300 mt-2 pl-9">
                        You&apos;ll be prompted for camera access when the session starts.
                      </p>
                    )}
                  </div>
                );
              }}
            />

            {/* Summary chips */}
            <div className="flex flex-wrap gap-2 py-3 border-t border-slate-100">
              {[
                `${numQuestions} questions`,
                `${diffLevel} difficulty`,
                sessionMode === "timed" ? "Timed" : sessionMode === "untimed" ? "Untimed" : "Topic Focus",
                sessionMode === "timed" && timeLimitMins ? `~${timeLimitMins} mins` : null,
              ].filter(Boolean).map(chip => (
                <span key={chip} className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><circle cx="4" cy="4" r="3" fill="#94a3b8"/></svg>
                  {chip}
                </span>
              ))}
            </div>

          </div>

          {/* footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-slate-100 dark:border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={subjectsBlocked || isPending}
              className="flex-1 h-11 rounded-xl flex items-center justify-center gap-x-2 text-sm font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{ background: "linear-gradient(135deg, #6366F1, #7C3AED)" }}
            >
              Start Practice Test {isPending && <SmallSpinner/>}
            </button>
          </div>

        </form>
      </DialogContent>
    </Dialog>

    <ErrorModal
                isErrorModalOpen={isErrorModalOpen}
                setErrorModalState={() => setErrorModalState(false)}
                subheading={errorModalMessage || "Please check your inputs and try again."}
              />
    </>
  );
}