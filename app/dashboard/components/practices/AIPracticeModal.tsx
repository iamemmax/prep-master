"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useMemo, useRef, useState } from "react";
import { Wand2, ShieldCheck, RotateCw, AlertTriangle } from "lucide-react";
import SessionGeneratingState from "./SessionGeneratingState";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useStartPracticeExam } from "../../util/apis/practice/createPracticeExam";
import { useGetPracticeExamConfig } from "../../util/apis/practice/fetchExamConfig";
import { useUserCategories } from "../../util/hooks/useUserCategories";
import { useSubscription } from "../subscription/SubscriptionProvider";
import { Crown } from "lucide-react";
import { useErrorModalState } from "@/hooks";
import { formatAxiosErrorMessage } from "@/utils";
import { ErrorModal } from "@/components/ui/ErrorModal";
import { SmallSpinner } from "@/components/ui/Spinner";
import { clearProctorReports } from "../../util/proctor/report";

const aiSchema = z.object({
  category_id: z.number().int().positive().optional(),
  exam_config_id: z.number({ message: "Pick an exam" }).int().positive(),
  // The subject dropdown's value is the picked subject's id (as a string so
  // the underlying Select component is happy). We derive the name from the
  // selected exam's subjects[] at submit time.
  subject_id: z.string().min(1, "Subject is required"),
  difficulty_level: z.enum(["easy", "medium", "hard"], { message: "Pick a difficulty" }),
  number_of_questions: z
    .number({ message: "Number of questions is required" })
    .min(1, "At least 1 question")
    .max(20, "Max 20 questions for AI practice"),
  session_mode: z.enum(["timed", "untimed"], { message: "Pick a session mode" }),
  time_limit_minutes: z.number().min(1, "At least 1 minute").nullable().optional(),
  enable_proctoring: z.boolean().default(false),
  use_ai_questions: z.boolean().default(true),
}).refine((d) => d.session_mode !== "timed" || (d.time_limit_minutes != null && d.time_limit_minutes > 0), {
  message: "Time limit is required for timed sessions",
  path: ["time_limit_minutes"],
});

type AIFormData = z.output<typeof aiSchema>;

const DIFFICULTIES = [
  { label: "Beginner", value: "easy" },
  { label: "Intermediate", value: "medium" },
  { label: "Advanced", value: "hard" },
] as const;

const QUESTION_PRESETS = [5, 10, 15, 20];
const TIME_PRESETS = [
  { label: "10 mins", value: 10 },
  { label: "20 mins", value: 20 },
  { label: "30 mins", value: 30 },
  { label: "45 mins", value: 45 },
  { label: "1 hr", value: 60 },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AIPracticeModal({ open, onClose }: Props) {
  const router = useRouter();
  const { openUpgradeModal } = useSubscription();
  const {
    isErrorModalOpen,
    setErrorModalState,
    openErrorModalWithMessage,
    errorModalMessage,
  } = useErrorModalState();

  const { data: examConfigResp, isLoading: loadingConfigs } = useGetPracticeExamConfig();
  const allExamConfigs = useMemo(
    () => (examConfigResp?.data ?? []).filter((e) => e.exam_type != null),
    [examConfigResp],
  );

  const { userCategories, isLoading: loadingCategories } = useUserCategories();

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<
    z.input<typeof aiSchema>,
    unknown,
    AIFormData
  >({
    resolver: zodResolver(aiSchema),
    defaultValues: {
      category_id: undefined,
      exam_config_id: undefined as unknown as number,
      subject_id: "",
      difficulty_level: "medium",
      number_of_questions: 10,
      session_mode: "untimed",
      time_limit_minutes: 30,
      enable_proctoring: false,
      use_ai_questions: true,
    },
  });

  const sessionMode = useWatch({ control, name: "session_mode" });
  const selectedCategoryId = useWatch({ control, name: "category_id" });
  const selectedExamConfigId = useWatch({ control, name: "exam_config_id" });

  // Subjects come from the picked exam config's exam_type.subjects[].
  const availableSubjects = useMemo(() => {
    const cfg = allExamConfigs.find((e) => e.id === selectedExamConfigId);
    return cfg?.exam_type?.subjects ?? [];
  }, [allExamConfigs, selectedExamConfigId]);

  // [needs-upgrade] sub-state controls a friendlier paywall view in place of
  // the generic error modal for subscription-gated AI failures.
  const [needsUpgrade, setNeedsUpgrade] = useState(false);

  // Narrow the exam picker to the user's exams within the picked category.
  // If no category is set, show all of the user's exam configs.
  const examConfigs = useMemo(() => {
    if (!selectedCategoryId) return allExamConfigs;
    const cat = userCategories.find((c) => c.id === selectedCategoryId);
    if (!cat) return [];
    const allowed = new Set(cat.exams.map((e) => e.id));
    return allExamConfigs.filter((e) => allowed.has(e.exam_type.id));
  }, [allExamConfigs, userCategories, selectedCategoryId]);

  // Default the exam picker to the user's first config once they load. Picking
  // a stale id is worse than picking nothing — wait for data, then seed.
  useEffect(() => {
    if (!open) return;
    if (examConfigs.length === 0) return;
    setValue("exam_config_id", examConfigs[0].id);
  }, [open, examConfigs, setValue]);

  // When the exam changes, drop any subject picked under the previous exam
  // (its subjects[] list is different) so the dropdown starts blank.
  useEffect(() => {
    setValue("subject_id", "");
  }, [selectedExamConfigId, setValue]);

  const { mutate: handleStart, isPending } = useStartPracticeExam();
  const [isRedirecting, setIsRedirecting] = useState(false);
  // Track retry attempts so the loading screen can show "(attempt N)". AI
  // generation can time out repeatedly while the model warms up, so timeouts
  // are retried indefinitely rather than bouncing the user to an error modal.
  const [retryAttempt, setRetryAttempt] = useState(0);
  // `retryAttempt > 0` means a retry is scheduled but the previous request has
  // already settled (isPending is briefly false during the backoff gap). Keep
  // the loader mounted across that gap so it doesn't flash the form between
  // attempts.
  const isStarting = isPending || isRedirecting || retryAttempt > 0;

  // Pending auto-retry bookkeeping. `abortedRef` lets a modal close cancel an
  // in-flight retry loop; `retryTimerRef` holds the scheduled-retry timer so we
  // can clear it on close/unmount and never fire a stray request.
  const abortedRef = useRef(false);
  const retryTimerRef = useRef<number | null>(null);
  // Remember the last submitted form data so the manual "Try again" button can
  // re-run the exact same request without the user re-filling the form.
  const lastDataRef = useRef<AIFormData | null>(null);

  // How many times we silently auto-retry a transient failure before handing
  // control to the user with a retry prompt. Generation usually succeeds on the
  // first or second retry once the model is warm.
  const AUTO_RETRY_LIMIT = 2;
  // When auto-retries are exhausted, we show a friendly "Try again" modal
  // instead of a dead-end error — a manual retry almost always works.
  const [showRetryPrompt, setShowRetryPrompt] = useState(false);

  const cancelPendingRetry = () => {
    abortedRef.current = true;
    if (retryTimerRef.current != null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  };

  // Clear any scheduled retry when the modal closes or the component unmounts so
  // a backgrounded timer can't restart a session the user already dismissed.
  // Also reset transient UI state so a reopened modal never starts on a stuck
  // loader or stale retry prompt.
  useEffect(() => {
    if (!open) {
      cancelPendingRetry();
      setIsRedirecting(false);
      setRetryAttempt(0);
      setShowRetryPrompt(false);
    }
    return () => cancelPendingRetry();
  }, [open]);

  // Stop a pending retry loop, reset transient state, and hand off to the parent.
  const handleClose = () => {
    cancelPendingRetry();
    setIsRedirecting(false);
    setRetryAttempt(0);
    setShowRetryPrompt(false);
    onClose();
  };

  // Manual retry from the "Try again" prompt — restart the auto-retry loop from
  // scratch using the last submitted form data.
  const handleManualRetry = () => {
    const data = lastDataRef.current;
    if (!data) return;
    setShowRetryPrompt(false);
    abortedRef.current = false;
    setRetryAttempt(0);
    setIsRedirecting(true);
    submitStart(data, 0);
  };

  // A "transient" failure is anything that a plain retry tends to fix: a real
  // timeout, a dropped/again-able connection, a rate-limit, or a gateway/5xx
  // from the proxy while the AI model is still warming up. These never mean the
  // user's input was wrong, so we retry them rather than showing an error.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isRetryableError = (error: any): boolean => {
    if (!error) return false;
    // Client aborted / network-level failures (no response ever arrived).
    if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") return true;
    if (!error.response) return true; // network drop, CORS, DNS, server unreachable
    const msg = String(error?.message ?? "").toLowerCase();
    if (msg.includes("timeout") || msg.includes("timed out") || msg.includes("network")) return true;
    // Transient server statuses: 408 Request Timeout, 425 Too Early,
    // 429 Too Many Requests, and 5xx gateway/server errors (502/503/504 are the
    // usual "model still warming up" responses, 500 often is too).
    const status = Number(error?.response?.status);
    return status === 408 || status === 425 || status === 429 || (status >= 500 && status <= 599);
  };

  const onSubmit = (data: AIFormData) => {
    // Entering fullscreen needs to happen synchronously inside the click for
    // the gesture requirement of the Fullscreen API.
    if (typeof document !== "undefined" && !document.fullscreenElement && data.enable_proctoring) {
      const el = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
      };
      const req = el.requestFullscreen ?? el.webkitRequestFullscreen;
      req?.call(el).catch(() => { /* denied or unsupported */ });
    }
    abortedRef.current = false;
    setRetryAttempt(0);
    submitStart(data, 0);
  };

  const submitStart = (data: AIFormData, attempt: number) => {
    if (abortedRef.current) return;
    lastDataRef.current = data;
    // Look up the picked subject so we can send either its id (when not using
    // AI generation — backend expects subjects_selected:[id]) or its name
    // (AI flow uses subject_name to seed the prompt).
    const pickedSubject = availableSubjects.find((s) => String(s.id) === data.subject_id);

    // `topics_selected` is intentionally omitted — backend rejects an empty
    // array and treats a missing field as "all topics".
    const basePayload = {
      exam_config_id: data.exam_config_id,
      number_of_questions: data.number_of_questions,
      use_ai_questions: data.use_ai_questions,
      session_mode: data.session_mode,
      difficulty_level: data.difficulty_level,
      time_limit_minutes: data.session_mode === "timed" ? data.time_limit_minutes ?? null : null,
      show_explanation_after_answer: false,
      enable_proctoring: data.enable_proctoring,
    };

    const subjectPayload = data.use_ai_questions
      ? { subjects_selected: [], subject_name: pickedSubject?.name ?? "" }
      : { subjects_selected: pickedSubject ? [pickedSubject.id] : [] };

    handleStart(
      { ...basePayload, ...subjectPayload },
      {
        onSuccess: (res) => {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("prep:proctoring", data.enable_proctoring ? "on" : "off");
            clearProctorReports();
          }
          setRetryAttempt(0);
          setIsRedirecting(true);
          router.push(
            `/dashboard/practice/start-practice/${res?.data?.session?.id ?? res?.data?.id}`,
          );
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
          // Transient failure (timeout, dropped connection, gateway/5xx while
          // the model warms up) — auto-retry silently a few times with a capped
          // backoff. AI generation often only succeeds on the second attempt.
          if (isRetryableError(error) && !abortedRef.current) {
            if (attempt < AUTO_RETRY_LIMIT) {
              const nextAttempt = attempt + 1;
              setRetryAttempt(nextAttempt);
              const backoff = Math.min(1500 + attempt * 1000, 8000);
              retryTimerRef.current = window.setTimeout(
                () => submitStart(data, nextAttempt),
                backoff,
              );
              return;
            }
            // Auto-retries exhausted — hand control to the user with a "Try
            // again" prompt instead of a dead-end error. A manual retry from
            // here almost always succeeds.
            setIsRedirecting(false);
            setRetryAttempt(0);
            setShowRetryPrompt(true);
            return;
          }

          setIsRedirecting(false);
          setRetryAttempt(0);
          const message =
            error?.response?.data?.data?.non_field_errors?.[0] ||
            error?.response?.data?.message ||
            formatAxiosErrorMessage(error as AxiosError) ||
            "An error occurred. Please try again.";
          const lower = String(message).toLowerCase();
          // Subscription-gated failures get a friendlier paywall card with a
          // direct Subscribe CTA rather than the generic error modal.
          if (lower.includes("subscription") || lower.includes("subscribe") || lower.includes("premium")) {
            setNeedsUpgrade(true);
            return;
          }
          openErrorModalWithMessage(String(message));
        },
      },
    );
  };

  return (
    <>
      <Dialog open={open}>
        <DialogContent
          className="bg-white dark:bg-zinc-900 border-none p-0 z-30 text-slate-900 dark:text-zinc-100"
          style={{ maxWidth: 500, zIndex: 9999 }}
          showCloseButton={false}
        >
          {isStarting ? (
            <SessionGeneratingState retryAttempt={retryAttempt} />
          ) : showRetryPrompt ? (
            <RetryRequired onRetry={handleManualRetry} onClose={handleClose} />
          ) : needsUpgrade ? (
            <UpgradeRequired
              onClose={() => { setNeedsUpgrade(false); handleClose(); }}
              onSubscribe={() => {
                setNeedsUpgrade(false);
                handleClose();
                openUpgradeModal();
              }}
            />
          ) : (
          // onSubmit only touches refs inside submit/timer callbacks, never during
          // render — the rule's render-time heuristic is a false positive here.
          // eslint-disable-next-line react-hooks/refs
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
              <div className="flex items-start gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #6366F1, #7C3AED)" }}
                >
                  <Wand2 size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">AI Practice</h2>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                    Pick an exam, type a subject — AI will build the questions.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="text-slate-300 hover:text-slate-500 transition-colors mt-0.5"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
              {/* Category — narrows the exam picker to user's exams in that category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">Category</label>
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(v) => {
                        const id = v ? Number(v) : undefined;
                        field.onChange(id);
                        // Switching categories invalidates any previously-picked exam.
                        setValue("exam_config_id", undefined as unknown as number);
                      }}
                      disabled={loadingCategories || userCategories.length === 0}
                    >
                      <SelectTrigger className="h-10 w-full bg-white dark:bg-zinc-900 dark:text-white text-xs">
                        <SelectValue
                          placeholder={
                            loadingCategories
                              ? "Loading categories…"
                              : userCategories.length === 0
                              ? "No categories yet"
                              : "All categories"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="z-10000" position="popper" sideOffset={4}>
                        {userCategories.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)} className="text-xs">
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Exam */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">Exam</label>
                <Controller
                  name="exam_config_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(v) => field.onChange(Number(v))}
                      disabled={loadingConfigs || examConfigs.length === 0}
                    >
                      <SelectTrigger className="h-10 w-full bg-white dark:bg-zinc-900 dark:text-white text-xs">
                        <SelectValue
                          placeholder={
                            loadingConfigs
                              ? "Loading exams…"
                              : examConfigs.length === 0
                              ? "Add an exam to your study plan first"
                              : "Select exam"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="z-10000" position="popper" sideOffset={4}>
                        {examConfigs.map((e) => (
                          <SelectItem key={e.id} value={String(e.id)} className="text-xs">
                            {e.exam_type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.exam_config_id && (
                  <p className="text-[10px] text-red-500 mt-1">{errors.exam_config_id.message}</p>
                )}
              </div>

              {/* Use AI questions toggle — when off, the session pulls real
                  questions for the chosen subject id; when on, the AI
                  generates fresh ones from the subject name. */}
              <Controller
                name="use_ai_questions"
                control={control}
                render={({ field }) => {
                  const on = !!field.value;
                  return (
                    <div className={`rounded-xl border hidden p-3 transition-all ${on ? "border-indigo-300 bg-indigo-50/50 dark:border-indigo-500/40 dark:bg-indigo-500/5" : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-2 min-w-0">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${on ? "bg-indigo-100 dark:bg-indigo-500/20" : "bg-slate-100 dark:bg-zinc-800"}`}>
                            <Wand2 size={14} className={on ? "text-indigo-600 dark:text-indigo-300" : "text-slate-400 dark:text-zinc-500"} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-700 dark:text-zinc-200 leading-tight">Use AI-generated questions</p>
                            <p className="text-[10px] text-slate-400 dark:text-white/70 leading-snug mt-0.5">
                              {on
                                ? "Fresh AI questions tailored to the subject"
                                : "Use existing questions from the question bank"}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => field.onChange(!on)}
                          className={`relative rounded-full transition-colors duration-200 shrink-0 ml-2 ${on ? "bg-indigo-600" : "bg-slate-200 dark:bg-zinc-700"}`}
                          style={{ width: 40, height: 22 }}
                          aria-pressed={on}
                        >
                          <div className={`absolute top-0.75 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${on ? "left-5.5" : "left-0.75"}`} />
                        </button>
                      </div>
                    </div>
                  );
                }}
              />

              {/* Subject name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">Subject</label>
                <Controller
                  name="subject_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      disabled={availableSubjects.length === 0 || !selectedExamConfigId}
                    >
                      <SelectTrigger className="h-10 w-full bg-white dark:bg-zinc-900 dark:text-white text-xs">
                        <SelectValue
                          placeholder={
                            !selectedExamConfigId
                              ? "Pick an exam first"
                              : availableSubjects.length === 0
                              ? "No subjects available for this exam"
                              : "Select subject"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="z-10000" position="popper" sideOffset={4}>
                        {availableSubjects.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)} className="text-xs">
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.subject_id && (
                  <p className="text-[10px] text-red-500 mt-1">{errors.subject_id.message}</p>
                )}
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">Difficulty</label>
                <Controller
                  name="difficulty_level"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-1.5">
                      {DIFFICULTIES.map((d) => (
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
              </div>

              {/* Number of questions */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">Number of Questions</label>
                <Controller
                  name="number_of_questions"
                  control={control}
                  render={({ field }) => (
                    <>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {QUESTION_PRESETS.map((q) => (
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
                          min={1}
                          max={20}
                          placeholder="1–20 questions"
                          value={field.value || ""}
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            field.onChange(Number.isFinite(n) ? Math.min(20, Math.max(0, n)) : 0);
                          }}
                          className="w-full h-9 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 text-xs text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 placeholder:text-slate-300 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-400 transition-colors"
                        />
                      )}
                    </>
                  )}
                />
                {errors.number_of_questions && (
                  <p className="text-[10px] text-red-500 mt-1">{errors.number_of_questions.message}</p>
                )}
              </div>

              {/* Session mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">Session mode</label>
                <Controller
                  name="session_mode"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { key: "untimed", label: "Untimed", sub: "Learn at your pace" },
                        { key: "timed", label: "Timed", sub: "Exam conditions" },
                      ] as const).map((m) => (
                        <button
                          type="button"
                          key={m.key}
                          onClick={() => field.onChange(m.key)}
                          className={`flex flex-col items-start gap-0.5 border rounded-xl p-3 text-left transition-all ${
                            field.value === m.key
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                              : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-indigo-300"
                          }`}
                        >
                          <span className={`text-xs font-bold ${field.value === m.key ? "text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-zinc-200"}`}>
                            {m.label}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">{m.sub}</span>
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>

              {/* Time limit — only for timed */}
              {sessionMode === "timed" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">Set time limit</label>
                  <Controller
                    name="time_limit_minutes"
                    control={control}
                    render={({ field }) => (
                      <div className="flex flex-wrap gap-1.5">
                        {TIME_PRESETS.map((t) => (
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
                      </div>
                    )}
                  />
                  {errors.time_limit_minutes && (
                    <p className="text-[10px] text-red-500 mt-1">{errors.time_limit_minutes.message}</p>
                  )}
                </div>
              )}

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
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 dark:border-zinc-800 shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isStarting || examConfigs.length === 0}
                className="flex-1 h-11 rounded-xl flex items-center justify-center gap-x-2 text-sm font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{ background: "linear-gradient(135deg, #6366F1, #7C3AED)" }}
              >
                {isStarting ? "Generating…" : "Start AI Practice"} {isStarting && <SmallSpinner />}
              </button>
            </div>
          </form>
          )}
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

// Shown in place of the form when the backend rejects the AI start because
// the user is on the free plan. Gives them a direct path to subscribe rather
// than the generic "An error occurred" toast.
function UpgradeRequired({ onClose, onSubscribe }: { onClose: () => void; onSubscribe: () => void }) {
  return (
    <div className="flex flex-col items-center text-center px-8 py-10">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-4"
        style={{ background: "linear-gradient(135deg, #F7C948, #FE9A00)" }}
      >
        <Crown size={26} className="text-white" fill="currentColor" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
        AI practice is a Premium feature
      </h3>
      <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-400 max-w-sm">
        Subscribe to unlock unlimited AI-generated questions tailored to your exam, plus full access to the question bank.
      </p>

      <div className="mt-6 w-full flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Maybe later
        </button>
        <button
          type="button"
          onClick={onSubscribe}
          className="flex-1 h-11 rounded-xl flex items-center justify-center gap-1.5 text-sm font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #6366F1, #7C3AED)" }}
        >
          <Crown size={14} fill="currentColor" /> Subscribe
        </button>
      </div>
    </div>
  );
}

// Shown after the silent auto-retries are exhausted on a transient failure.
// AI generation frequently only succeeds on a follow-up attempt once the model
// is warm, so we keep the user in the flow with a one-tap "Try again" instead
// of dropping them on a dead-end error modal.
function RetryRequired({ onRetry, onClose }: { onRetry: () => void; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center text-center px-8 py-10">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-4"
        style={{ background: "linear-gradient(135deg, #6366F1, #7C3AED)" }}
      >
        <AlertTriangle size={26} className="text-white" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
        Generation is taking longer than usual
      </h3>
      <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-400 max-w-sm">
        The AI is warming up and timed out a few times. This usually clears on the next try —
        give it another go.
      </p>

      <div className="mt-6 w-full flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="flex-1 h-11 rounded-xl flex items-center justify-center gap-1.5 text-sm font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #6366F1, #7C3AED)" }}
        >
          <RotateCw size={14} /> Try again
        </button>
      </div>
    </div>
  );
}

