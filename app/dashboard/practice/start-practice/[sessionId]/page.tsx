"use client";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Option } from "@/app/dashboard/util/types/pratcie/StartPracticeTypes";
import { useSubmitQuestionAnswer } from "@/app/dashboard/util/apis/practice/submitQuestionAnswer";
import { useEndSession } from "@/app/dashboard/util/apis/practice/endSession";
import { useGetPracticeQuestions } from "@/app/dashboard/util/apis/practice/getPracticeQuestion";
import PracticeRightPanel, { RightPanelProps } from "@/app/dashboard/components/practices/PracticeRightPannel";
import { SmallSpinner } from "@/components/ui/Spinner";
import { ErrorModal } from "@/components/ui/ErrorModal";
import { useErrorModalState } from "@/hooks";
import { formatAxiosErrorMessage } from "@/utils";
import { AxiosError } from "axios";

function parseOptions(raw: Option[] | Record<string, string> | string): Option[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "object") return Object.entries(raw).map(([key, val], i) => ({ id: i, reference: key, option_text: val }));
  try {
    const parsed = JSON.parse(raw);
    return Object.entries(parsed).map(([key, val], i) => ({ id: i, reference: key, option_text: val as string }));
  } catch { return []; }
}

export default function PracticeExamUI({ params }: { params: Promise<{ sessionId: string }> }) {
   const {
      isErrorModalOpen,
      setErrorModalState,
      openErrorModalWithMessage,
      errorModalMessage,
    } = useErrorModalState();
  const router    = useRouter();
  const { sessionId } = use(params);

  const { data, isLoading } = useGetPracticeQuestions(sessionId);

  const session   = data?.data ?? null;
  const questions = (data?.data?.questions ?? []).map(q => ({ ...q, options: parseOptions(q.options) }));
  const TOTAL     = questions.length;

  const [current, setCurrent]     = useState(0);
  const [answers, setAnswers]     = useState<Record<number, number>>({});
  const [flagged, setFlagged]     = useState<Set<number>>(new Set());
  const [seconds, setSeconds]     = useState(0);
  const [paused, setPaused]       = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [sessionResult, setSessionResult] = useState<{ score: number; correct_answers: number; total_questions: number } | null>(null);

  const { mutate: submitAnswer } = useSubmitQuestionAnswer();
  const { mutate: endSession, isPending:isEnding,}   = useEndSession();

  useEffect(() => {
    if (session?.time_limit_minutes) setSeconds(session.time_limit_minutes * 60);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  useEffect(() => {
    if (!session || session.session_mode === "untimed" || paused) return;
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [session, paused]);

  if (!sessionId || isLoading || !session || questions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f172a]">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const answered     = new Set(Object.keys(answers).map(Number));
  const mins         = Math.floor(seconds / 60);
  const secs         = seconds % 60;
  const timerDisplay = `${mins}:${secs.toString().padStart(2, "0")}`;
  const totalSecs    = (session.time_limit_minutes ?? 0) * 60 || 34 * 60 + 22;
  const timerPct     = Math.round((seconds / totalSecs) * 100);
  const avgPaceSecs  = answered.size > 0 ? Math.round((totalSecs - seconds) / answered.size) : 0;
  const avgPaceLabel = avgPaceSecs > 0 ? `${Math.floor(avgPaceSecs / 60)}m ${avgPaceSecs % 60}s / question` : "—";
  const progress     = Math.round((answered.size / TOTAL) * 100);
  const currentQ     = questions[current];
  const selectedAnswer = answers[current] ?? null;
  const isMath       = currentQ?.subject?.name?.toLowerCase().includes("math");

  const topicNames = [...new Set(questions.map(q => q.topic.name))];
  const topicProgress = topicNames.map(name => ({
    name,
    total: questions.filter(q => q.topic.name === name).length,
    done:  questions.filter((q, i) => q.topic.name === name && answered.has(i)).length,
  }));

  function getDotClass(i: number) {
    if (i === current)   return "bg-indigo-600 text-white border-indigo-600";
    if (flagged.has(i))  return "bg-amber-400 text-white border-amber-400";
    if (answered.has(i)) return "bg-teal-500 text-white border-teal-500";
    return "bg-white text-slate-500 border-slate-200 hover:border-slate-300";
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
    setFlagged(prev => { const n = new Set(prev); n.has(current) ? n.delete(current) : n.add(current); return n; });
  }
  function handleEnd() {
    endSession(
      { session_id: session!.id },
      { onSuccess: (res) => setSessionResult(res.data),
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
     onError: (error: any) => {
  const errorMessage = 
    error?.response?.data?.data?.non_field_errors?.[0]
    || error?.response?.data?.message
    || formatAxiosErrorMessage(error as AxiosError)
    || 'An error occurred. Please try again.';
  openErrorModalWithMessage(String(errorMessage));
}

       }
    );
  }

  const panelProps: RightPanelProps = {
    answered, flagged, current, total: TOTAL, seconds, totalSecs,
    timerDisplay, timerPct, avgPaceSecs, avgPaceLabel,
    topicProgress, getDotClass, setCurrent, setShowPanel, onEnd: handleEnd,
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] overflow-hidden">

      {/* ── Top Bar ── */}
      <div className="flex items-center px-3 sm:px-5 h-13 bg-[#111827] border-b border-white/[0.07] shrink-0 gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-base">🎓</span>
          <span className="text-xs sm:text-sm font-bold text-white">{session.exam_type} Practice</span>
          <span className="hidden sm:inline text-white/20 mx-1">·</span>
          <span className="hidden sm:inline text-[10px] text-white/60 capitalize">{session.session_mode}</span>
          <span className="hidden sm:inline text-white/20 mx-1">·</span>
          <span className="hidden sm:inline text-[10px] text-white/30 capitalize">{session.difficulty_level}</span>
        </div>

        <div className="flex-1 flex flex-col items-center gap-0.5 px-2 sm:px-6">
          <span className="text-[9px] sm:text-[10px] text-white/40 font-mono">Q {answered.size} of {TOTAL}</span>
          <div className="w-full max-w-xs h-0.75 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {session.session_mode === "timed" && (
            <div className="flex items-center gap-1 sm:gap-1.5 bg-white/6 border border-white/9 px-2 sm:px-3 py-1.5 rounded-full">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="#f59e0b" strokeWidth="1.3"/>
                <path d="M6 3v3l2 1.5" stroke="#f59e0b" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span className="text-[10px] sm:text-xs font-bold text-amber-400 font-mono">{timerDisplay}</span>
            </div>
          )}
          <button onClick={() => setPaused(p => !p)}
            className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full border border-white/10 text-white/60 hover:text-white transition-all">
            <svg width="8" height="10" viewBox="0 0 8 10" fill="currentColor">
              {paused ? <path d="M1 1l6 4-6 4V1z"/> : <><rect x="0" y="0" width="3" height="10" rx="1"/><rect x="5" y="0" width="3" height="10" rx="1"/></>}
            </svg>
            {paused ? "Resume" : "Pause"}
          </button>
          <button onClick={() => setShowPanel(p => !p)}
            className="sm:hidden flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-full border border-white/10 text-white/60">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="1" y="1" width="4" height="10" rx="1"/><rect x="7" y="1" width="4" height="6" rx="1"/>
            </svg>
          </button>
          <button onClick={handleEnd} className="text-[10px] flex items-center justify-center
          gap-2 font-bold px-3 sm:px-4 py-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
            End {isEnding && <SmallSpinner/>}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden gap-3 p-2 sm:p-3">

        {/* ── Left Card ── */}
        <div className="flex-1 bg-white rounded-2xl flex flex-col overflow-hidden shadow-sm min-w-0">

          <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[9px] sm:text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-md">
                {isMath ? "Math" : "Reading Comprehension"}
              </span>
              <span className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${
                currentQ.difficulty_level === "easy"   ? "bg-green-50 text-green-700 border-green-200"
                : currentQ.difficulty_level === "medium" ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-red-50 text-red-700 border-red-200"
              }`}>{currentQ.difficulty_level}</span>
              <span className="text-[9px] sm:text-[10px] text-slate-400">{currentQ.topic.name}</span>
            </div>
            <button onClick={toggleFlag}
              className={`flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold px-2 py-1 rounded-md border transition-all ${
                flagged.has(current) ? "bg-amber-50 text-amber-600 border-amber-300" : "text-slate-400 border-slate-200 hover:border-slate-300"
              }`}>
              <svg width="8" height="9" viewBox="0 0 10 12" fill={flagged.has(current) ? "#d97706" : "none"} stroke="currentColor" strokeWidth="1.4">
                <path d="M2 1v10M2 1h6L6.5 5 9 8H2"/>
              </svg>
              <span className="hidden sm:inline">Flag</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4">
            <div>
              <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Question {current + 1}</p>
              <p className="text-[12px] sm:text-[13px] font-semibold text-slate-800 leading-relaxed mb-3 sm:mb-4">
                {currentQ.text}
              </p>
              <div className="space-y-1.5 sm:space-y-2">
                {currentQ.options.map((opt, i) => (
                  <button key={opt.id} onClick={() => selectOption(i)}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border text-left transition-all ${
                      selectedAnswer === i ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/20"
                    }`}>
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center shrink-0 text-[10px] sm:text-[11px] font-bold transition-all ${
                      selectedAnswer === i ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 text-slate-400"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className={`text-[11px] sm:text-[12px] leading-relaxed ${selectedAnswer === i ? "text-indigo-800 font-medium" : "text-slate-600"}`}>
                      {opt.option_text}
                    </span>
                  </button>
                ))}
              </div>

              {session.show_explanation_after_answer && selectedAnswer !== null && currentQ.explanation && (
                <div className="mt-4 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                  <p className="text-[10px] font-bold text-indigo-600 mb-1">Explanation</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between px-3 sm:px-5 py-3 border-t border-slate-100 bg-white shrink-0 sticky bottom-0 z-10">
            <button onClick={() => navigate(-1)} disabled={current === 0}
              className="flex items-center gap-1.5 text-[11px] font-semibold px-4 py-2.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              ← Previous
            </button>
            <span className="text-[10px] text-slate-300 text-center px-2">
              {selectedAnswer === null ? "Select an answer" : ""}
            </span>
          <button
  onClick={() => {
    if (current === TOTAL - 1) {
      handleEnd();
    } else {
      navigate(1);
    }
  }}
  disabled={isEnding}
  className={`flex items-center gap-1.5 cursor-pointer text-[11px] justify-center font-semibold px-4 py-2.5 rounded-lg border transition-all ${
    current === TOTAL - 1
      ? "border-indigo-500 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
      : "border-slate-200 text-slate-500 hover:bg-slate-50"
  }`}
>
  {current === TOTAL - 1 ? (
    <span className="flex items-center gap-1.5">
      {isEnding ? <SmallSpinner /> : "Finish ✓"}
    </span>
  ) : "Next →"}
</button>
          </div>
        </div>

        {/* ── Right Panel — desktop ── */}
        <div className="hidden md:flex w-70 lg:w-sm shrink-0 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex-1">
            <PracticeRightPanel {...panelProps} />
          </div>
        </div>
      </div>

      {/* ── Mobile bottom sheet ── */}
      {showPanel && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPanel(false)} />
          <div className="relative bg-white rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
              <p className="text-sm font-bold text-slate-800">Session Progress</p>
              <button onClick={() => setShowPanel(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <PracticeRightPanel {...panelProps} />
            </div>
          </div>
        </div>
      )}

      {/* ── Session Result Modal ── */}
      {sessionResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800">Session Complete!</h2>
            <div className="w-full bg-slate-50 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Score</span>
                <span className="text-sm font-bold text-indigo-600">{parseFloat(sessionResult.score.toFixed(2))}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Correct Answers</span>
                <span className="text-sm font-semibold text-slate-800">{sessionResult.correct_answers} / {sessionResult.total_questions}</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(sessionResult.correct_answers / sessionResult.total_questions) * 100}%` }} />
              </div>
            </div>
            <button onClick={() => router.push("/dashboard/practice")}
              className="w-full h-11 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #6366F1, #7C3AED)" }}>
              Back to Practice
            </button>
          </div>
        </div>
      )}


        <ErrorModal
                  isErrorModalOpen={isErrorModalOpen}
                  setErrorModalState={() =>{
                    router.push("/dashboard/practice")
                    setErrorModalState(false)}}
                  subheading={errorModalMessage || "Please check your inputs and try again."}
                />
    </div>
  );
}
