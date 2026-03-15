import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm, Controller,useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Exam } from "../../practice/page";
import { useStartPracticeExam } from "../../util/apis/practice/createPracticeExam";
import { useErrorModalState } from "@/hooks";
import { formatAxiosErrorMessage } from "@/utils";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { ErrorModal } from "@/components/ui/ErrorModal";
import { SmallSpinner } from "@/components/ui/Spinner";

// ─── Schema ──────────────────────────────────────────────────────────────────
const sessionSchema = z.object({
  exam_type_id:                   z.number({ message: "Exam type is required" }),
  number_of_questions:            z.number({ message: "Number of questions is required" }).min(1, "At least 1 question").max(2700, "Max 2,700 questions"),
  session_mode:                   z.enum(["timed", "untimed", "topic-focus"], { message: "Session mode is required" }),
  difficulty_level:               z.enum(["mixed", "easy", "medium", "hard"], { message: "Difficulty is required" }),
  time_limit_minutes:             z.number().min(1, "At least 1 minute").nullable().optional(),
  subjects_selected:              z.array(z.number()).default([]),   // ← removed .optional()
  topics_selected:                z.array(z.number()).default([]),   // ← removed .optional()
  show_explanation_after_answer:  z.boolean().default(false),
}).refine(data => {
  if (data.session_mode === "timed") {
    return data.time_limit_minutes != null && data.time_limit_minutes > 0;
  }
  return true;
}, { message: "Time limit is required for timed sessions", path: ["time_limit_minutes"] });

export type SessionFormData = z.output<typeof sessionSchema>;

// ─── Constants ────────────────────────────────────────────────────────────────
const DIFFICULTIES = [
  { label: "Mixed",  value: "mixed"  },
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
export default function SessionSetupModal({ onClose, examName = "SAT", examDesc = "Standardized Test for College Admissions", open, onSubmit: onSubmitProp }: {
  onClose?: () => void;
  examName?: string;
  examDesc?: string;
  open: Exam | null;
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
  formState: { errors },
} = useForm<z.input<typeof sessionSchema>, unknown, z.output<typeof sessionSchema>>({
  resolver: zodResolver(sessionSchema),
  defaultValues: {
    exam_type_id:                  open?.id ?? 1,
    number_of_questions:           30,
    session_mode:                  "timed",
    difficulty_level:              "mixed",
    time_limit_minutes:            45,
    subjects_selected:             [],
    topics_selected:               [],
    show_explanation_after_answer: false,
  },
});
const router = useRouter()
const {mutate:handleStart,isPending} = useStartPracticeExam()
// onSubmit now receives the OUTPUT type (with defaults applied)
const onSubmit = (data: z.output<typeof sessionSchema>) => {
  handleStart(data,{
    onSuccess:()=>{
       router.push("/dashboard/practice/start-practice")
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
// const showExplain   = useWatch({ control, name: "show_explanation_after_answer" });



  return (

    <>
    <Dialog open={open !== null} onOpenChange={() => onClose?.()}>
      <DialogContent
        className="bg-white border-none p-0 z-30 text-slate-900"
        style={{ maxWidth: 520, zIndex: 9999 }}
        showCloseButton={false}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[90vh]">

          {/* header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
            <div>
              <h2 className="text-base font-bold text-slate-900">{examName} — Session Setup</h2>
              <p className="text-xs text-slate-400 mt-0.5">{examDesc}</p>
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
              <label className="block text-xs font-semibold text-slate-700 mb-2">Difficulty</label>
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
                            : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
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

            {/* Number of Questions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Number of Questions</label>
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
                              : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
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
                            : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
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
                        className="w-full h-9 border border-slate-200 rounded-lg px-3 text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 transition-colors"
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
              <label className="block text-xs font-semibold text-slate-700 mb-2">Session mode</label>
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
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-slate-200 bg-white hover:border-indigo-300"
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full border-2 mb-1 flex items-center justify-center ${
                          field.value === m.key ? "border-indigo-600" : "border-slate-300"
                        }`}>
                          {field.value === m.key && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                        </div>
                        <span className={`text-[11px] font-bold leading-tight ${field.value === m.key ? "text-indigo-700" : "text-slate-700"}`}>
                          {m.label}
                        </span>
                        <span className="text-[9px] text-slate-400 leading-tight">{m.sub}</span>
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
                <label className="block text-xs font-semibold text-slate-700 mb-2">Set time limit</label>
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
                                : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
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
                              : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
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
                          className="w-full h-9 border border-slate-200 rounded-lg px-3 text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 transition-colors"
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
              <span className="text-xs font-semibold text-slate-700">Show explanation after each answer</span>
              <Controller
                name="show_explanation_after_answer"
                control={control}
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className={`relative rounded-full transition-colors duration-200 ${field.value ? "bg-indigo-600" : "bg-slate-200"}`}
                    style={{ width: 40, height: 22 }}
                  >
                    <div className={`absolute top-0.75 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${field.value ? "left-5.5" : "left-0.75"}`} />
                  </button>
                )}
              />
            </div>

            {/* Summary chips */}
            <div className="flex flex-wrap gap-2 py-3 border-t border-slate-100">
              {[
                `${numQuestions} questions`,
                `${diffLevel} difficulty`,
                sessionMode === "timed" ? "Timed" : sessionMode === "untimed" ? "Untimed" : "Topic Focus",
                sessionMode === "timed" && timeLimitMins ? `~${timeLimitMins} mins` : null,
              ].filter(Boolean).map(chip => (
                <span key={chip} className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><circle cx="4" cy="4" r="3" fill="#94a3b8"/></svg>
                  {chip}
                </span>
              ))}
            </div>

          </div>

          {/* footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-xl flex items-center justify-center gap-x-2 text-sm font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
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