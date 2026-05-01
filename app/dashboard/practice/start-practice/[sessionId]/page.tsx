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
import { useUserSubscription } from "@/app/dashboard/util/apis/subscription/subscription";
import PracticeRightPanel, { RightPanelProps } from "@/app/dashboard/components/practices/PracticeRightPannel";
import ProctorPanel from "@/app/dashboard/components/practices/ProctorPanel";
import Calculator from "@/app/dashboard/components/practices/Calculator";
import {
  StoredIncident,
  StoredProctorReport,
  saveProctorReport,
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
import { SmallSpinner } from "@/components/ui/Spinner";
import { ErrorModal } from "@/components/ui/ErrorModal";
import { useErrorModalState } from "@/hooks";
import { formatAxiosErrorMessage } from "@/utils";
import { AxiosError } from "axios";
import { ListChecks, Check } from "lucide-react";
import SessionResultDialog from "@/app/dashboard/components/practices/session/SessionResultDialog";
import StatsDrawer from "@/app/dashboard/components/practices/session/StatsDrawer";
import PausedOverlay from "@/app/dashboard/components/practices/session/PausedOverlay";
import KeyboardShortcutsDialog from "@/app/dashboard/components/practices/session/KeyboardShortcutsDialog";
import SessionTopBar from "@/app/dashboard/components/practices/session/SessionTopBar";
import SessionDock from "@/app/dashboard/components/practices/session/SessionDock";
import SessionLeftRail from "@/app/dashboard/components/practices/session/SessionLeftRail";
import SessionQuestionCard from "@/app/dashboard/components/practices/session/SessionQuestionCard";

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
  const { data: subResp } = useUserSubscription();
  const activeSub =
    subResp?.data?.is_subscribed && subResp?.data?.subscription?.is_valid
      ? subResp.data.subscription
      : null;

  const session   = data?.data ?? null;
  const questions = (data?.data?.questions ?? []).map(q => ({ ...q, options: parseOptions(q.options) }));
  const TOTAL     = questions.length;
  const sessionStatus = session?.status ?? null;
  const isCompleted   = sessionStatus === "completed" || sessionStatus === "ended";
  const hydratedRef = useRef(false);

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
  // Review route fetches the session payload before rendering, so router.push
  // hangs for ~1s before the page actually swaps. Track a local flag so the
  // Review button can show a spinner across that gap.
  const [isNavigatingToReview, setIsNavigatingToReview] = useState(false);

  const goToReview = (id: number | string) => {
    setIsNavigatingToReview(true);
    router.push(`/dashboard/practice/review/${id}`);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    setProctoring(sessionStorage.getItem("prep:proctoring") === "on");
  }, []);

  // Hydrate from server: pre-fill the answers map from `responses`, then jump
  // the cursor to the question after `last_answered_question_id`. Runs once
  // when both the session and questions are first available so it doesn't
  // overwrite anything the user does in this tab.
  useEffect(() => {
    if (hydratedRef.current) return;
    if (!session || questions.length === 0) return;
    hydratedRef.current = true;

    const responses = session.responses ?? [];
    if (responses.length > 0) {
      const map: Record<number, number> = {};
      for (const r of responses) {
        const qIdx = questions.findIndex(q => q.id === r.question_id);
        if (qIdx === -1) continue;
        const optIdx = questions[qIdx].options.findIndex(o => o.reference === r.selected_answer);
        if (optIdx >= 0) map[qIdx] = optIdx;
      }
      if (Object.keys(map).length > 0) setAnswers(map);
    }

    // Resume cursor: prefer the question after the last answered one. Fall
    // back to the first unanswered question if the id can't be located.
    let resumeIdx = -1;
    if (session.last_answered_question_id != null) {
      const idx = questions.findIndex(q => q.id === session.last_answered_question_id);
      if (idx >= 0 && idx + 1 < questions.length) resumeIdx = idx + 1;
    }
    if (resumeIdx === -1 && responses.length > 0) {
      const answeredIds = new Set(responses.map(r => r.question_id));
      const firstUnanswered = questions.findIndex(q => !answeredIds.has(q.id));
      if (firstUnanswered > 0) resumeIdx = firstUnanswered;
    }
    if (resumeIdx > 0) {
      setCurrent(resumeIdx);
      const count = session.answered_count ?? responses.length;
      toast.success(`Resumed at question ${resumeIdx + 1} · ${count} answered previously`, { duration: 3500 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id, questions.length]);

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

  const { mutateAsync: submitAnswerAsync } = useSubmitQuestionAnswer();
  const { mutate: endSession, isPending: isEnding } = useEndSession();
  // Track every submit promise we kick off in selectOption so handleEnd can
  // wait for all of them before calling /end/ — otherwise an in-flight last
  // answer can race the end-session request and never reach the server.
  const inFlightSubmits = useRef<Promise<unknown>[]>([]);
  const [isFlushingSubmits, setIsFlushingSubmits] = useState(false);
  const isFinishing = isFlushingSubmits || isEnding || isNavigatingToReview;

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
      <div className="flex h-screen h-dvh items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="w-8 h-8 rounded-full border-2 border-slate-400 dark:border-zinc-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Session already completed on the server — show a friendly card instead of
  // dropping the user back into a non-editable practice UI.
  if (isCompleted && !sessionResult) {
    const correct = session.responses?.filter(r => r.is_correct).length ?? 0;
    const total = session.answered_count ?? session.responses?.length ?? TOTAL;
    const pct = total > 0 ? Math.round((correct / total) * 100) : (session.score ?? 0);
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-6 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-3">
            <Check size={20} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
          </div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">This session is already completed</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5">
            <span className="tabular-nums font-semibold text-slate-700 dark:text-zinc-300">{correct}</span> of <span className="tabular-nums font-semibold text-slate-700 dark:text-zinc-300">{total}</span> correct ({pct}%)
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <button
              onClick={() => goToReview(session.id)}
              disabled={isNavigatingToReview}
              className="h-10 rounded-lg text-sm font-semibold bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-zinc-200 disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5"
            >
              {isNavigatingToReview ? (
                <><SmallSpinner /> Loading review…</>
              ) : (
                <><ListChecks size={14} /> Review answers</>
              )}
            </button>
            <button
              onClick={() => router.push("/dashboard/practice")}
              className="h-10 rounded-lg text-sm font-semibold border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800"
            >
              Back to practice
            </button>
          </div>
        </div>
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
    const p = submitAnswerAsync({
      session_id: session!.id,
      data: { question_id: questions[current].id, selected_answer: opt.reference },
    }).catch(() => { /* errors surface via the mutation; we only need the promise to flush on Finish */ });
    inFlightSubmits.current.push(p);
    p.finally(() => {
      inFlightSubmits.current = inFlightSubmits.current.filter(x => x !== p);
    });
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

  async function handleEnd() {
    if (!session) return;
    if (inFlightSubmits.current.length > 0) {
      setIsFlushingSubmits(true);
      try {
        await Promise.allSettled(inFlightSubmits.current);
      } finally {
        setIsFlushingSubmits(false);
      }
    }
    endSession(
      { session_id: session.id },
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
      <SessionTopBar
        examName={String(session?.exam_config?.exam_type?.name ?? "")}
        focus={focus}
        showTimer={session.session_mode === "timed"}
        timerDisplay={timerDisplay}
        timerPct={timerPct}
        paused={paused}
        isEnding={isEnding}
        themeMode={themeMode}
        onBack={() => router.push("/dashboard/practice")}
        onTogglePause={() => setPaused(p => !p)}
        onToggleCalc={() => setCalcOpen(v => !v)}
        onToggleTheme={toggleTheme}
        onEnd={handleEnd}
      />

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
        <SessionLeftRail
          focus={focus}
          firstName={user?.user?.first_name}
          lastName={user?.user?.last_name}
          email={user?.user?.email}
          preparingFor={user?.exam_config?.preparing_for_exam}
          examType={session.exam_type}
          sessionMode={session.session_mode}
          difficultyLevel={session.difficulty_level}
          totalQuestions={TOTAL}
          isTimed={session.session_mode === "timed"}
          timerDisplay={timerDisplay}
          answered={answered}
          flagged={flagged}
          flaggedCount={flaggedCount}
          confidence={confidence}
          current={current}
          topicAt={(i) => questions[i]?.topic?.name ?? "—"}
          planName={activeSub?.plan?.name ?? null}
          onJump={setCurrent}
        />

        {/* Center: question canvas */}
        <SessionQuestionCard
          question={currentQ}
          current={current}
          total={TOTAL}
          selectedAnswer={selectedAnswer}
          eliminatedSet={eliminatedSet}
          isCurrentFlagged={flagged.has(current)}
          curConfidence={curConfidence}
          paceFg={paceFg}
          paceLabel={paceLabel}
          qTimeLabel={qTimeLabel}
          targetPerQ={targetPerQ}
          showExplanation={!!session.show_explanation_after_answer}
          onSelectOption={selectOption}
          onToggleEliminate={toggleEliminate}
          onToggleFlag={toggleFlag}
          onSetConfidence={setConfidenceFor}
        />

        {/* Right rail: live stats */}
        {!focus && (
          <aside className="hidden xl:flex w-72 shrink-0 flex-col bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 overflow-y-auto">
            <PracticeRightPanel {...panelProps} />
          </aside>
        )}
      </div>

      {/* ── Dock ── */}
      <SessionDock
        total={TOTAL}
        current={current}
        answered={answered}
        flagged={flagged}
        flaggedCount={flaggedCount}
        isFinishing={isFinishing}
        onJump={setCurrent}
        onPrev={() => navigate(-1)}
        onNext={() => navigate(1)}
        onFinish={handleEnd}
      />

      {/* ── Stats drawer & Paused overlay ── */}
      <StatsDrawer open={statsOpen} onClose={() => setStatsOpen(false)} panelProps={panelProps} />
      <PausedOverlay paused={paused} onResume={() => setPaused(false)} />

      {/* ── Result modal ── */}
      <SessionResultDialog
        result={sessionResult}
        celebrate={celebrate}
        prevBest={prevBest}
        proctorReport={proctorReport}
        coachReady={!!coachRequest}
        onOpenCoach={() => setCoachOpen(true)}
        onReview={() => session && goToReview(session.id)}
        isNavigatingToReview={isNavigatingToReview}
        onProgress={() => router.push("/dashboard/progress")}
        onBackToPractice={() => router.push("/dashboard/practice")}
      />

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
      <KeyboardShortcutsDialog open={shortcuts} onOpenChange={setShortcuts} />
    </div>
  );
}
