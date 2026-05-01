"use client";
import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { parseOptions } from "@/app/dashboard/util/practice/parseOptions";
import {
  formatTimer,
  getPaceTone,
  summarizeTopicProgress,
} from "@/app/dashboard/util/practice/sessionLogic";
import { useSubmitQuestionAnswer } from "@/app/dashboard/util/apis/practice/submitQuestionAnswer";
import { useEndSession } from "@/app/dashboard/util/apis/practice/endSession";
import { useGetPracticeQuestions } from "@/app/dashboard/util/apis/practice/getPracticeQuestion";
import PracticeRightPanel, { RightPanelProps } from "@/app/dashboard/components/practices/PracticeRightPannel";
import ProctorPanel from "@/app/dashboard/components/practices/ProctorPanel";
import Calculator from "@/app/dashboard/components/practices/Calculator";
import {
  StoredIncident,
  StoredProctorReport,
  saveProctorReport,
  downloadProctorPDF,
  openProctorPDF,
} from "@/app/dashboard/util/proctor/report";
import CoachFeedbackModal from "@/app/dashboard/components/coach/CoachFeedbackModal";
import { TourAutoStart } from "@/app/dashboard/util/tour/TourContext";
import { recordScore, getPersonalBest } from "@/app/dashboard/util/shared/personalBests";
import ConfettiBurst from "@/app/dashboard/components/celebrate/ConfettiBurst";
import {
  AIFeedbackRequest,
  MistakeAnalysisRequest,
  WeaknessPlanRequest,
} from "@/app/dashboard/util/ai/types";
import toast from "react-hot-toast";
import { useAuth } from "@/context/authentication";
import { useTheme } from "@/context/theme";
import * as Avatar from "@radix-ui/react-avatar";
import { SmallSpinner } from "@/components/ui/Spinner";
import { ErrorModal } from "@/components/ui/ErrorModal";
import { useErrorModalState } from "@/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatAxiosErrorMessage } from "@/utils";
import { AxiosError } from "axios";
import {
  Keyboard, X as XIcon, Zap, Clock3,
  Play, Pause, BarChart3, ArrowLeft, Sun, Moon, Sparkles, ListChecks,
  ChevronLeft, ChevronRight, Check, Flag, Trophy, Download, Eye,
  Calculator as CalcIcon,
} from "lucide-react";
import { isProductionGated } from "@/components/shared/coming-soon-gate";

type Confidence = "guess" | "likely" | "certain";

export default function PracticeExamUI({ params }: { params: Promise<{ sessionId: string }> }) {
  const {
    isErrorModalOpen,
    setErrorModalState,
    openErrorModalWithMessage,
    errorModalMessage,
  } = useErrorModalState();
  const router    = useRouter();
  const { sessionId } = use(params);
  const { authState: { user } } = useAuth();
  const { resolved: themeMode, toggle: toggleTheme } = useTheme();

  const { data, isLoading } = useGetPracticeQuestions(sessionId);

  const session   = data?.data ?? null;
  const questions = (data?.data?.questions ?? []).map(q => ({ ...q, options: parseOptions(q.options) }));
  const TOTAL     = questions.length;

  const [current, setCurrent]     = useState(0);
  const [answers, setAnswers]     = useState<Record<number, number>>({});
  const [flagged, setFlagged]     = useState<Set<number>>(new Set());
  const [seconds, setSeconds]     = useState(0);
  const [paused, setPaused]       = useState(false);
  const [sessionResult, setSessionResult] = useState<{ score: number; correct_answers: number; total_questions: number } | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [prevBest, setPrevBest] = useState<number | null>(null);
  const [coachOpen, setCoachOpen] = useState(false);
  const [coachRequest, setCoachRequest] = useState<AIFeedbackRequest | null>(null);
  const [mistakesRequest, setMistakesRequest] = useState<MistakeAnalysisRequest | null>(null);
  const [planRequest, setPlanRequest] = useState<WeaknessPlanRequest | null>(null);
  const [proctoring, setProctoring] = useState(false);
  const [proctorReport, setProctorReport] = useState<StoredProctorReport | null>(null);
  const incidentsRef = useRef<StoredIncident[]>([]);
  const sessionStartRef = useRef<string>(new Date().toISOString());

  const [eliminated, setEliminated]   = useState<Record<number, Set<number>>>({});
  const [confidence, setConfidence]   = useState<Record<number, Confidence>>({});
  const [qElapsed, setQElapsed]       = useState(0);
  const [focus, setFocus]             = useState(false);
  const [shortcuts, setShortcuts]     = useState(false);
  const [statsOpen, setStatsOpen]     = useState(false);
  const [calcOpen, setCalcOpen]       = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setProctoring(sessionStorage.getItem("prep:proctoring") === "on");
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!document.documentElement.requestFullscreen) return;
    const enter = () => {
      if (document.fullscreenElement) return;
      document.documentElement.requestFullscreen().catch(() => { /* denied or unsupported */ });
    };
    const onFirstGesture = () => {
      enter();
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
    };
    window.addEventListener("pointerdown", onFirstGesture, { once: true });
    window.addEventListener("keydown", onFirstGesture, { once: true });
    window.addEventListener("touchstart", onFirstGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
    };
  }, []);

  useEffect(() => { setQElapsed(0); }, [current]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setQElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [paused]);

  const { mutate: submitAnswer } = useSubmitQuestionAnswer();
  const { mutate: endSession, isPending: isEnding } = useEndSession();

  useEffect(() => {
    if (session?.time_limit_minutes) setSeconds(session.time_limit_minutes * 60);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  useEffect(() => {
    if (!session || session.session_mode === "untimed" || paused) return;
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [session, paused]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!session || questions.length === 0) return;

      const k = e.key.toLowerCase();
      const opts = questions[current]?.options ?? [];
      if (/^[1-9]$/.test(k)) {
        const i = parseInt(k, 10) - 1;
        if (i < opts.length) { e.preventDefault(); selectOption(i); }
      } else if (/^[a-d]$/.test(k)) {
        const i = k.charCodeAt(0) - 97;
        if (i < opts.length) { e.preventDefault(); selectOption(i); }
      } else if (k === "arrowright") { e.preventDefault(); navigate(1); }
      else if (k === "arrowleft")  { e.preventDefault(); navigate(-1); }
      else if (k === "f")          { e.preventDefault(); toggleFlag(); }
      else if (k === " ")          { e.preventDefault(); setPaused(p => !p); }
      else if (k === "z")          { e.preventDefault(); setFocus(f => !f); }
      else if (k === "?")          { e.preventDefault(); setShortcuts(s => !s); }
      else if (k === "escape")     { if (focus) setFocus(false); if (shortcuts) setShortcuts(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, questions, focus, shortcuts, session]);

  if (!sessionId || isLoading || !session || questions.length === 0) {
    return (
      <div className="flex  h-dvh items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="w-8 h-8 rounded-full border-2 border-slate-400 dark:border-zinc-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const answered     = new Set(Object.keys(answers).map(Number));
  const timerDisplay = formatTimer(seconds);
  const totalSecs    = (session.time_limit_minutes ?? 0) * 60 || 34 * 60 + 22;
  const timerPct     = Math.round((seconds / totalSecs) * 100);
  const avgPaceSecs  = answered.size > 0 ? Math.round((totalSecs - seconds) / answered.size) : 0;
  const avgPaceLabel = avgPaceSecs > 0 ? `${Math.floor(avgPaceSecs / 60)}m ${avgPaceSecs % 60}s / question` : "—";
  const progress     = Math.round((answered.size / TOTAL) * 100);
  const currentQ     = questions[current];
  const selectedAnswer = answers[current] ?? null;

  const topicProgress = summarizeTopicProgress(questions, answered);

  function getDotClass(i: number) {
    if (i === current)   return "bg-[#F7C948] text-white border-[#F7C948]";
    if (flagged.has(i))  return "bg-amber-400 text-white border-amber-400";
    if (answered.has(i)) return "bg-emerald-500 text-white border-emerald-500";
    return "bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600";
  }

  function selectOption(idx: number) {
    setAnswers(prev => ({ ...prev, [current]: idx }));
    const opt = questions[current].options[idx];
    submitAnswer(
      { session_id: session!.id, data: { question_id: questions[current].id, selected_answer: opt.reference } }
    );
  }
  function navigate(dir: number) {
    const next = current + dir;
    if (next < 0 || next >= TOTAL) return;
    setCurrent(next);
  }
  function toggleFlag() {
    setFlagged(prev => { const n = new Set(prev); if (n.has(current)) n.delete(current); else n.add(current); return n; });
  }
  function toggleEliminate(optIdx: number, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setEliminated(prev => {
      const next = { ...prev };
      const set = new Set(next[current] ?? []);
      if (set.has(optIdx)) set.delete(optIdx); else set.add(optIdx);
      next[current] = set;
      return next;
    });
  }
  function setConfidenceFor(level: Confidence) {
    setConfidence(prev => ({ ...prev, [current]: level }));
  }

  function handleEnd() {
    endSession(
      { session_id: session!.id },
      {
        onSuccess: (res) => {
          setSessionResult(res.data);

          // Personal-best celebration: capture the previous high for this
          // exam type *before* we persist the new one, so the banner can
          // show "beat your X%!". First-ever run also counts as a best.
          if (session) {
            const examKey = String(session.exam_type ?? "");
            const before = getPersonalBest(examKey);
            setPrevBest(before);
            const isBest = recordScore(examKey, res.data.score);
            if (isBest) setCelebrate(true);
          }

          // Snapshot session context for the AI coach. Weak/strong split is
          // an estimate — the server answer key isn't on the client, so the
          // backend will replace this with authoritative per-topic numbers.
          if (session) {
            const scoreRate = res.data.total_questions > 0
              ? res.data.correct_answers / res.data.total_questions
              : 0;
            // Attempted-per-topic proxies for "familiarity" — topics with
            // more attempts land in the stronger bucket, fewer in the weaker.
            const topicAttempts = new Map<string, number>();
            questions.forEach((q, i) => {
              if (answers[i] == null) return;
              const name = q.topic?.name ?? "General";
              topicAttempts.set(name, (topicAttempts.get(name) ?? 0) + 1);
            });
            const ranked = Array.from(topicAttempts.entries())
              .map(([name, attempts]) => ({ name, attempts }))
              .sort((a, b) => b.attempts - a.attempts);
            const mid = Math.ceil(ranked.length / 2);
            const strongTopics = ranked.slice(0, mid).map(r => r.name);
            const weakTopics   = ranked.slice(mid).map(r => r.name);

            const totalAnswered = Object.keys(answers).length || 1;
            const avgTime = Math.max(0, Math.round((totalSecs - seconds) / totalAnswered));

            setCoachRequest({
              session_id: session.id,
              score: res.data.score,
              accuracy: Math.round(scoreRate * 100),
              avgTime,
              totalQuestions: TOTAL,
              weakTopics,
              strongTopics,
            });

            // Mistake payload — client doesn't know which answers are wrong
            // (server-side check), so we approximate: take questions the user
            // was least confident on plus any answered in a below-average
            // topic. Backend will replace this with the authoritative set.
            const estimatedWrong = Math.max(
              0,
              res.data.total_questions - res.data.correct_answers,
            );
            const candidateIdx = Object.keys(answers).map(Number);
            // Prefer "guess" confidence, then "likely", then fall through.
            const prioritized = candidateIdx.sort((a, b) => {
              const rank = (c: typeof confidence[number]) =>
                c === "guess" ? 0 : c === "likely" ? 1 : c === "certain" ? 2 : 3;
              return rank(confidence[a]) - rank(confidence[b]);
            });
            const wrongSample = prioritized.slice(0, estimatedWrong).map(i => {
              const q = questions[i];
              const sel = answers[i] != null ? q.options[answers[i]] : null;
              return {
                text: q.text,
                selected_answer: sel?.option_text,
                topic: q.topic?.name,
                explanation: q.explanation,
              };
            });
            setMistakesRequest({
              session_id: session.id,
              questions: wrongSample,
            });

            setPlanRequest({
              session_id: session.id,
              topics: weakTopics,
            });
          }

          if (proctoring && session) {
            const endedIso = new Date().toISOString();
            const startedIso = sessionStartRef.current;
            const durationSec = Math.max(
              0,
              Math.round((new Date(endedIso).getTime() - new Date(startedIso).getTime()) / 1000),
            );
            const report: StoredProctorReport = {
              id: String(session.id),
              sessionId: session.id,
              examType: String(session.exam_type ?? ""),
              sessionMode: String(session.session_mode ?? ""),
              difficulty: String(session.difficulty_level ?? ""),
              totalQuestions: TOTAL,
              score: res.data.score,
              correctAnswers: res.data.correct_answers,
              startedAtIso: startedIso,
              endedAtIso: endedIso,
              durationSec,
              incidents: incidentsRef.current,
              createdAt: Date.now(),
            };
            setProctorReport(report);
            saveProctorReport(report);
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.data?.non_field_errors?.[0]
            || error?.response?.data?.message
            || formatAxiosErrorMessage(error as AxiosError)
            || "An error occurred. Please try again.";
          openErrorModalWithMessage(String(errorMessage));
        },
      }
    );
  }

  function handleIncident(incident: StoredIncident) {
    incidentsRef.current = [...incidentsRef.current, incident];
  }

  const panelProps: RightPanelProps = {
    answered, flagged, current, total: TOTAL, seconds, totalSecs,
    timerDisplay, timerPct, avgPaceSecs, avgPaceLabel,
    topicProgress, getDotClass, setCurrent, setShowPanel: setStatsOpen, onEnd: handleEnd,
  };

  const targetPerQ = session.session_mode === "timed" && TOTAL > 0
    ? Math.max(30, Math.round(totalSecs / TOTAL))
    : 90;
  const paceTone    = getPaceTone(qElapsed, targetPerQ);
  const paceFg      =
    paceTone === "ok"   ? "#059669" :
    paceTone === "warn" ? "#D97706" :
                          "#DC2626";
  const paceLabel   = paceTone === "ok" ? "on pace" : paceTone === "warn" ? "slowing" : "lingering";
  const qTimeLabel  = formatTimer(qElapsed);

  const eliminatedSet = eliminated[current] ?? new Set<number>();
  const curConfidence = confidence[current];
  const flaggedCount  = flagged.size;

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-inter">

      <TourAutoStart tourId="session" />

      {/* ── Header ── */}
      <header data-tour="session-header" className={`flex items-center px-4 sm:px-6 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 shrink-0 gap-3 transition-all duration-300 overflow-hidden ${focus ? "h-0 border-b-0 opacity-0" : "h-12 opacity-100"}`}>
        <button
          onClick={() => router.push("/dashboard/practice")}
          title="Back to practice"
          aria-label="Back to practice"
          className="inline-flex items-center justify-center w-8 h-8 -ml-1 rounded-md text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-200 transition-colors shrink-0"
        >
          <ArrowLeft size={14} />
        </button>
        <div className="flex items-center min-w-0">
          <span className="inline-flex items-center h-8 px-3 rounded-md bg-[#F7C948] text-[#5A3300] font-black text-sm tracking-tight truncate shadow-sm">
            {String(session.exam_type ?? "").toUpperCase() || "PRACTICE"}
          </span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          {session.session_mode === "timed" && (
            <span className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-bold font-mono tabular-nums transition-colors ${
              timerPct < 20
                ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10"
                : "text-slate-900 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800"
            }`}>
              <Clock3 size={11} />
              {timerDisplay}
            </span>
          )}
          <IconBtn onClick={() => setPaused(p => !p)} label={paused ? "Resume (Space)" : "Pause (Space)"}>
            {paused ? <Play size={13} fill="currentColor" /> : <Pause size={13} fill="currentColor" />}
          </IconBtn>
          <IconBtn onClick={() => setCalcOpen(v => !v)} label="Calculator">
            <CalcIcon size={13} />
          </IconBtn>
          <IconBtn onClick={toggleTheme} label={themeMode === "dark" ? "Light mode" : "Dark mode"}>
            {themeMode === "dark" ? <Sun size={13} /> : <Moon size={13} />}
          </IconBtn>
          <button
            onClick={handleEnd}
            className="ml-1 h-8 px-3 rounded-md bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1.5"
          >
            End {isEnding && <SmallSpinner />}
          </button>
        </div>
      </header>

      {/* ── Progress strip ── */}
      <div className={`h-0.5 bg-slate-200 dark:bg-zinc-800 shrink-0 transition-all duration-300 ${focus ? "opacity-0" : "opacity-100"}`}>
        <div
          className="h-full bg-[#F7C948] transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── 3-column body ── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* Left rail: profile + session summary */}
        {!focus && (
          <aside className="hidden lg:flex w-72 shrink-0 flex-col bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 overflow-y-auto">
            {/* Profile card */}
            <div className="px-4 py-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
              <div className="flex items-center gap-3">
                <Avatar.Root className="w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-[#F7C948]/30">
                  <Avatar.Fallback className="w-full h-full bg-linear-to-tr from-[#2B7FFF] to-[#615FFF] flex items-center justify-center text-white text-sm font-semibold font-inter">
                    {((user?.user?.first_name?.[0] ?? "") + (user?.user?.last_name?.[0] ?? "")).toUpperCase() || "U"}
                  </Avatar.Fallback>
                </Avatar.Root>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                    {user?.user?.first_name || user?.user?.last_name
                      ? `${user?.user?.first_name ?? ""} ${user?.user?.last_name ?? ""}`.trim()
                      : "Student"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                    {user?.user?.email ?? "—"}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                <div>
                  <p className="uppercase tracking-wider text-[9px] font-semibold text-slate-400 dark:text-zinc-500">Preparing for</p>
                  <p className="font-semibold text-slate-800 dark:text-zinc-100 mt-0.5">
                    {user?.exam_config?.preparing_for_exam ?? session.exam_type}
                  </p>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#894B00] dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded">
                  Free
                </span>
              </div>
            </div>

            {/* Session details */}
            <div className="px-4 py-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400 mb-2">
                Session
              </p>
              <dl className="space-y-1.5 text-[11px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500 dark:text-zinc-400">Exam</dt>
                  <dd className="font-semibold text-slate-900 dark:text-zinc-100 truncate">{session.exam_type}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500 dark:text-zinc-400">Mode</dt>
                  <dd className="font-semibold text-slate-900 dark:text-zinc-100 capitalize">{session.session_mode}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500 dark:text-zinc-400">Difficulty</dt>
                  <dd className="font-semibold text-slate-900 dark:text-zinc-100 capitalize">{session.difficulty_level}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500 dark:text-zinc-400">Questions</dt>
                  <dd className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">{TOTAL}</dd>
                </div>
                {session.session_mode === "timed" && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-zinc-400">Remaining</dt>
                    <dd className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums font-mono">{timerDisplay}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Live stats */}
            <div className="px-4 py-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400 mb-3">
                This session
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 py-2">
                  <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums leading-none">{answered.size}</p>
                  <p className="text-[9px] uppercase tracking-wider text-emerald-700/70 dark:text-emerald-400/70 mt-1">Done</p>
                </div>
                <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 py-2">
                  <p className="text-lg font-semibold text-amber-700 dark:text-amber-400 tabular-nums leading-none">{flaggedCount}</p>
                  <p className="text-[9px] uppercase tracking-wider text-amber-700/70 dark:text-amber-400/70 mt-1">Flag</p>
                </div>
                <div className="rounded-lg bg-slate-100 dark:bg-zinc-800 py-2">
                  <p className="text-lg font-semibold text-slate-700 dark:text-zinc-200 tabular-nums leading-none">{TOTAL - answered.size}</p>
                  <p className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 mt-1">Left</p>
                </div>
              </div>

              {/* Confidence breakdown */}
              {(() => {
                const counts = { guess: 0, likely: 0, certain: 0 };
                Object.values(confidence).forEach(c => { counts[c]++; });
                const total = counts.guess + counts.likely + counts.certain;
                if (total === 0) return null;
                const rows = [
                  { key: "certain", label: "Certain", count: counts.certain, color: "bg-emerald-500" },
                  { key: "likely",  label: "Likely",  count: counts.likely,  color: "bg-amber-400"   },
                  { key: "guess",   label: "Guess",   count: counts.guess,   color: "bg-rose-500"    },
                ];
                return (
                  <div className="mt-4">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400 mb-2">
                      Confidence
                    </p>
                    <div className="space-y-1.5">
                      {rows.map(r => (
                        <div key={r.key}>
                          <div className="flex items-center justify-between text-[10px] mb-0.5">
                            <span className="text-slate-500 dark:text-zinc-400">{r.label}</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-300 tabular-nums">{r.count}</span>
                          </div>
                          <div className="h-1 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                            <div className={`h-full rounded-full ${r.color}`} style={{ width: `${(r.count / total) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Flagged */}
            <div className="px-4 py-4 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400">
                  Flagged
                </p>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  {flaggedCount}
                </span>
              </div>
              {flaggedCount === 0 ? (
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 italic">No flagged questions yet.</p>
              ) : (
                <ul className="space-y-1">
                  {Array.from(flagged).sort((a, b) => a - b).map(i => (
                    <li key={i}>
                      <button
                        onClick={() => setCurrent(i)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] transition-colors ${
                          i === current
                            ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300"
                            : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <Flag size={10} fill="#D97706" className="text-amber-500 shrink-0" />
                        <span className="truncate">Q{i + 1} · {questions[i]?.topic?.name ?? "—"}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        )}

        {/* Center: question canvas */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          <div data-tour="session-question" className="max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-10">

          {/* Meta row */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-zinc-500 font-semibold">
                Question {current + 1} of {TOTAL}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">{currentQ.topic.name}</p>
                <span className={`text-[10px] font-bold capitalize px-1.5 py-0.5 rounded ${
                  currentQ.difficulty_level === "easy"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : currentQ.difficulty_level === "medium"
                    ? "bg-amber-50 text-[#894B00] dark:bg-amber-500/10 dark:text-amber-400"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                }`}>
                  {currentQ.difficulty_level}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold h-7 px-2 rounded-md tabular-nums"
                style={{ color: paceFg, background: `${paceFg}1a` }}
                title={`Target ${Math.floor(targetPerQ / 60)}:${(targetPerQ % 60).toString().padStart(2, "0")} per question`}
              >
                <Clock3 size={10} />
                {qTimeLabel}
                <span className="hidden md:inline text-[8px] uppercase tracking-wider opacity-80">· {paceLabel}</span>
              </span>
              <button
                onClick={toggleFlag}
                className={`inline-flex items-center gap-1 h-7 px-2 rounded-md text-[10px] font-bold transition-colors ${
                  flagged.has(current)
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                    : "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
                }`}
              >
                <Flag size={10} fill={flagged.has(current) ? "currentColor" : "transparent"} />
                <span className="hidden sm:inline">{flagged.has(current) ? "Flagged" : "Flag"}</span>
              </button>
            </div>
          </div>

          {/* Question text */}
          <p className="text-[16px] sm:text-[17px] leading-[1.7] text-slate-800 dark:text-zinc-200 mb-7 font-medium">
            {currentQ.text}
          </p>

          {/* Options */}
          <div className="space-y-2 mb-6">
            {currentQ.options.map((opt, i) => {
              const isEliminated = eliminatedSet.has(i);
              const isSelected   = selectedAnswer === i;
              return (
                <div key={opt.id} className="group relative">
                  <button
                    onClick={() => selectOption(i)}
                    className={`w-full flex items-center gap-3 sm:gap-4 pl-3 pr-10 py-3 sm:py-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-[#F7C948] bg-amber-50/60 dark:bg-amber-500/10"
                        : isEliminated
                        ? "border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/60 opacity-55"
                        : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-[#F7C948] text-white"
                        : isEliminated
                        ? "bg-slate-100 dark:bg-zinc-800 text-slate-300 dark:text-zinc-600"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className={`flex-1 text-sm sm:text-[15px] leading-relaxed ${
                      isSelected
                        ? "text-slate-900 dark:text-zinc-100 font-semibold"
                        : isEliminated
                        ? "text-slate-400 dark:text-zinc-600 line-through decoration-rose-400/70"
                        : "text-slate-700 dark:text-zinc-300"
                    }`}>
                      {opt.option_text}
                    </span>
                    {isSelected && <Check size={16} className="text-[#894B00] dark:text-[#F7C948] shrink-0" strokeWidth={3} />}
                  </button>
                  <button
                    onClick={(e) => toggleEliminate(i, e)}
                    title={isEliminated ? "Restore" : "Cross out this option"}
                    className={`absolute top-1/2 -translate-y-1/2 right-2 w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                      isEliminated
                        ? "bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 opacity-100"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-400"
                    }`}
                  >
                    <XIcon size={13} strokeWidth={2.2} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Confidence capture */}
          {selectedAnswer !== null && (
            <div data-tour="session-confidence" className="flex items-center justify-between gap-3 flex-wrap pt-4 border-t border-slate-200 dark:border-zinc-800">
              <p className="text-xs font-semibold text-slate-600 dark:text-zinc-400 inline-flex items-center gap-1.5">
                <Zap size={12} className="text-[#F7C948]" />
                How confident?
              </p>
              <div className="inline-flex gap-0 border border-slate-200 dark:border-zinc-700 rounded-md overflow-hidden">
                {([
                  { key: "guess",   label: "Guess"   },
                  { key: "likely",  label: "Likely"  },
                  { key: "certain", label: "Certain" },
                ] as const).map(o => {
                  const active = curConfidence === o.key;
                  return (
                    <button
                      key={o.key}
                      onClick={() => setConfidenceFor(o.key)}
                      className={`text-[11px] font-semibold px-3 py-1.5 transition-colors ${
                        active
                          ? "bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                          : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Explanation */}
          {session.show_explanation_after_answer && selectedAnswer !== null && currentQ.explanation && (
            <div className="mt-5 rounded-lg border border-slate-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                Explanation
              </p>
              <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}
          </div>
        </div>

        {/* Right rail: live stats */}
        {!focus && (
          <aside className="hidden xl:flex w-72 shrink-0 flex-col bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 overflow-y-auto">
            <PracticeRightPanel {...panelProps} />
          </aside>
        )}
      </div>

      {/* ── Dock ── */}
      <footer data-tour="session-footer" className="bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-3 px-4 sm:px-6 py-2.5">
          <div className="flex-1 flex items-center justify-center overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            <div className="flex items-center gap-1.5 min-w-max px-2">
              {Array.from({ length: TOTAL }, (_, i) => {
                const isCur = i === current;
                const isAns = answered.has(i);
                const isFlg = flagged.has(i);
                return (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    title={`Q${i + 1}${isAns ? " · answered" : ""}${isFlg ? " · flagged" : ""}`}
                    className={`relative rounded-full transition-all ${
                      isCur
                        ? "w-6 h-2 bg-[#F7C948]"
                        : isAns
                        ? "w-2 h-2 bg-emerald-500 hover:scale-125"
                        : "w-2 h-2 bg-slate-300 dark:bg-zinc-700 hover:bg-slate-400 dark:hover:bg-zinc-600"
                    }`}
                  >
                    {isFlg && !isCur && (
                      <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-amber-400 ring-2 ring-white dark:ring-zinc-900" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="hidden md:block text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums shrink-0">
            <span className="font-semibold text-slate-700 dark:text-zinc-300">{answered.size}</span> answered
            {flaggedCount > 0 && <span> · <span className="font-semibold text-amber-600 dark:text-amber-400">{flaggedCount}</span> flagged</span>}
          </p>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate(-1)}
              disabled={current === 0}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-xs font-bold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
              Prev
            </button>
            <button
              onClick={() => current === TOTAL - 1 ? handleEnd() : navigate(1)}
              disabled={isEnding}
              className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-xs font-bold transition-colors ${
                current === TOTAL - 1
                  ? "bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60"
                  : "bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-zinc-200"
              }`}
            >
              {current === TOTAL - 1 ? (
                <>{isEnding ? <SmallSpinner /> : <>Finish <Check size={14} strokeWidth={2.6} /></>}</>
              ) : <>Next <ChevronRight size={14} /></>}
            </button>
          </div>
        </div>
      </footer>

      {/* ── Stats drawer ── */}
      {statsOpen && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setStatsOpen(false)}>
          <div className="flex-1 bg-black/40 backdrop-blur-[2px]" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-80 max-w-[85vw] bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-zinc-800"
          >
            <div className="flex items-center justify-between px-4 h-12 border-b border-slate-200 dark:border-zinc-800 shrink-0">
              <div className="flex items-center gap-2">
                <BarChart3 size={14} className="text-slate-500 dark:text-zinc-400" />
                <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Session stats</p>
              </div>
              <button onClick={() => setStatsOpen(false)} className="text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 p-1 rounded">
                <XIcon size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <PracticeRightPanel {...panelProps} />
            </div>
          </div>
        </div>
      )}

      {/* ── Paused overlay ── */}
      {paused && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/70 dark:bg-black/70 backdrop-blur-sm"
          onClick={() => setPaused(false)}
        >
          <div className="flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-xl">
              <Pause size={22} className="text-white" fill="white" />
            </div>
            <p className="text-white font-semibold text-base">Paused</p>
            <p className="text-white/60 text-xs">
              Press <kbd className="bg-white/10 text-white px-1.5 py-0.5 rounded text-[10px] font-mono">Space</kbd> or tap anywhere to resume
            </p>
          </div>
        </div>
      )}

      {/* ── Result modal ── */}
    <Dialog
  open={!!sessionResult}
  onOpenChange={(open) => { if (!open) setSessionResult(null); }}
>
  <DialogContent
    showCloseButton={false}
    className="sm:max-w-md max-h-[90dvh] overflow-y-auto bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 p-0 gap-0"
  >
    {sessionResult && (() => {
      const pct = sessionResult.score;
      const tone =
        pct >= 75 ? "emerald" :
        pct >= 50 ? "amber" : "rose";
      const ringColor =
        tone === "emerald" ? "#10b981" :
        tone === "amber" ? "#F7C948" : "#f43f5e";
      const R = 52;
      const C = 2 * Math.PI * R;

      return (
        <>
          {/* HERO — score ring */}
          <div
            className={cn(
              "relative px-6 pt-8 pb-6 text-center transition-colors",
              celebrate
                ? "bg-linear-to-b from-amber-50 to-transparent dark:from-amber-500/10"
                : "bg-linear-to-b from-slate-50/50 to-transparent dark:from-zinc-800/30"
            )}
          >
            <DialogHeader className="items-center text-center sm:text-center mb-5">
              <DialogTitle className="text-[13px] font-medium text-slate-500 dark:text-zinc-400 tracking-wide">
                {celebrate ? "🎉  New personal best!" : "Session complete"}
              </DialogTitle>
              <DialogDescription className="sr-only">Your session results</DialogDescription>
            </DialogHeader>

            {/* Circular score */}
            <div className="relative inline-flex items-center justify-center w-32 h-32 mx-auto">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120" aria-hidden>
                <circle
                  cx="60" cy="60" r={R}
                  strokeWidth="8"
                  fill="none"
                  className="stroke-slate-100 dark:stroke-zinc-800"
                />
                <circle
                  cx="60" cy="60" r={R}
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                  stroke={ringColor}
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - pct / 100)}
                  style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[32px] leading-none font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                  {Math.round(pct)}
                  <span className="text-lg text-slate-400 dark:text-zinc-500 ml-0.5">%</span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums mt-1.5">
                  {sessionResult.correct_answers} / {sessionResult.total_questions} correct
                </span>
              </div>
            </div>

            {/* Celebration subline */}
            {celebrate && (
              <p className="text-xs text-slate-600 dark:text-zinc-300 mt-4">
                {prevBest != null
                  ? <>Previous best: <span className="font-semibold tabular-nums">{prevBest.toFixed(0)}%</span></>
                  : <>First run on this exam — you set the bar.</>}
              </p>
            )}
          </div>

          {/* ACTIONS */}
          <div className="px-6 pb-6 pt-1 flex flex-col gap-2">

            {/* Proctoring — compact inline row */}
            {proctorReport && (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/30 pl-3 pr-2 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    proctorReport.incidents.length === 0 ? "bg-emerald-500" : "bg-amber-500"
                  )} />
                  <p className="text-xs text-slate-700 dark:text-zinc-300 truncate whitespace-nowrap">
                    Proctoring · {proctorReport.incidents.length} incident{proctorReport.incidents.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => openProctorPDF(proctorReport)}
                    className="p-1.5 rounded-md text-slate-500 dark:text-zinc-400 hover:bg-white hover:text-slate-900 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 transition-colors"
                    aria-label="View proctoring report"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => downloadProctorPDF(proctorReport)}
                    className="p-1.5 rounded-md text-slate-500 dark:text-zinc-400 hover:bg-white hover:text-slate-900 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 transition-colors"
                    aria-label="Download proctoring report"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* AI coach — featured */}
           {!isProductionGated()&& <>


            {coachRequest && (
              <button
                onClick={() => setCoachOpen(true)}
                className="group w-full h-11 rounded-lg text-sm font-semibold text-white inline-flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-orange-500/25 whitespace-nowrap"
                style={{ background: "linear-gradient(135deg, #FE9A00, #FF6900)" }}
              >
                <Sparkles size={14} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
                Get AI coach feedback
              </button>
            )}

            {/* Secondary row: Review + Progress */}
            <div className="flex items-center gap-2">
              {session && (
                <button
                  onClick={() => router.push(`/dashboard/practice/review/${session.id}`)}
                  className="flex-1 h-10 rounded-lg text-sm font-semibold border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <ListChecks size={14} />
                  Review
                </button>
              )}
              <button
                onClick={() => router.push("/dashboard/progress")}
                className="flex-1 h-10 rounded-lg text-sm font-semibold border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap"
              >
                Progress
              </button>
            </div>
</>}
            {/* Primary CTA */}
            <button
              onClick={() => router.push("/dashboard/practice")}
              className="w-full h-11 rounded-lg text-sm font-semibold bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors whitespace-nowrap"
            >
              Back to practice
            </button>
          </div>
        </>
      );
    })()}
  </DialogContent>
</Dialog>

      <ErrorModal
        isErrorModalOpen={isErrorModalOpen}
        setErrorModalState={() => {
          router.push("/dashboard/practice");
          setErrorModalState(false);
        }}
        subheading={errorModalMessage || "Please check your inputs and try again."}
      />

      {proctoring && (
        <div data-tour="session-proctor">
          <ProctorPanel
            onIncident={handleIncident}
            sessionStartIso={sessionStartRef.current}
          />
        </div>
      )}

      <CoachFeedbackModal
        open={coachOpen}
        onClose={() => setCoachOpen(false)}
        overviewRequest={coachRequest}
        mistakesRequest={mistakesRequest}
        planRequest={planRequest}
        onPracticeWrong={(questions) => {
          // Hook-point for the backend: POST these question IDs to create a
          // focused re-attempt session, then router.push into it. For now
          // surface a toast so the UX loop feels complete.
          toast.success(
            `${questions.length} question${questions.length === 1 ? "" : "s"} queued — a focused re-attempt session is coming.`,
            { duration: 4000 },
          );
          router.push("/dashboard/practice");
        }}
      />

      <ConfettiBurst active={celebrate} onDone={() => setCelebrate(false)} />

      {calcOpen && <Calculator onClose={() => setCalcOpen(false)} />}

      {/* ── Shortcuts overlay ── */}
      <Dialog open={shortcuts} onOpenChange={setShortcuts}>
        <DialogContent className="sm:max-w-sm bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 gap-3">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-zinc-100">
              <Keyboard size={15} className="text-slate-500 dark:text-zinc-400" />
              Keyboard shortcuts
            </DialogTitle>
            <DialogDescription className="sr-only">Keyboard shortcuts reference for this practice session.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            {[
              ["A – D",  "Select answer"],
              ["1 – 9",  "Select answer"],
              ["→",      "Next question"],
              ["←",      "Previous"],
              ["F",      "Flag question"],
              ["Space",  "Pause / resume"],
              ["Z",      "Focus mode"],
              ["?",      "Show this panel"],
              ["Esc",    "Close overlays"],
            ].map(([keys, label]) => (
              <div key={keys} className="flex items-center justify-between gap-2 py-1">
                <span className="text-slate-500 dark:text-zinc-400">{label}</span>
                <kbd className="inline-flex items-center justify-center min-w-10 px-1.5 h-5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-[10px] font-bold border border-slate-200 dark:border-zinc-700">
                  {keys}
                </kbd>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 italic mt-1">
            Tip: hover any option and click × to eliminate it.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IconBtn({
  onClick,
  label,
  children,
  desktopOnly,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  desktopOnly?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`${desktopOnly ? "hidden md:inline-flex" : "inline-flex"} items-center justify-center w-8 h-8 rounded-md text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-200 transition-colors`}
    >
      {children}
    </button>
  );
}
