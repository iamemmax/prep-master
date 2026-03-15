"use client";
import { useState, useEffect } from "react";
import PracticeRightPanel, { RightPanelProps } from "../../components/practices/PracticeRightPannel";

export const TOTAL_QUESTIONS = 30;

const MOCK_QUESTIONS = [
  {
    id: 0, tag: "Easy", topic: "Reading",
    passage: "The following passage is adapted from a 2023 article about the effects of urban green spaces on mental health.\n\nResearchers at the University of Copenhagen conducted a longitudinal study tracking 2,400 urban residents over five years. Participants who lived within 300 metres of a public park reported significantly lower levels of stress and anxiety compared to those who lived farther away. Notably, the study found that even brief visits — as short as 20 minutes — produced measurable reductions in cortisol, the body's primary stress hormone.\n\nThe researchers controlled for income, age, and pre-existing health conditions, suggesting the relationship between green space access and mental wellbeing is robust across demographic groups.",
    stem: "According to the passage, which of the following best describes the researchers' conclusion about the relationship between green space access and mental health?",
    options: ["The effect is only significant for residents who spend more than two hours per day in parks.", "Access to green space reliably improves mental wellbeing regardless of demographic background.", "Urban planning should prioritise parks over public transport infrastructure.", "Cortisol reduction is the primary measure of mental health used in longitudinal studies."],
    correct: 1,
  },
  {
    id: 1, tag: "Medium", topic: "Reading",
    passage: "This passage is adapted from a 2022 essay on the history of the printing press.\n\nJohannes Gutenberg's invention of movable type in the mid-15th century fundamentally altered the spread of information across Europe. Before the press, manuscripts were painstakingly copied by hand, limiting literacy to the clergy and nobility. Within decades of Gutenberg's innovation, books became affordable to merchants and craftsmen, fuelling demand for education and igniting the intellectual fires of the Renaissance.\n\nHistorians debate whether the press caused the Reformation or merely accelerated it. What is certain is that Martin Luther's 95 Theses, printed and distributed across Germany in weeks, would have taken years to circulate in the manuscript era.",
    stem: "The author's primary purpose in the second paragraph is to:",
    options: ["Argue that Gutenberg was more important than Martin Luther.", "Illustrate how the printing press changed the speed of idea dissemination.", "Suggest that the Reformation would not have occurred without the printing press.", "Explain why historians disagree about the causes of the Renaissance."],
    correct: 1,
  },
  {
    id: 2, tag: "Hard", topic: "Reading",
    passage: "Adapted from a 2021 paper on cognitive load theory in educational psychology.\n\nCognitive load theory posits that working memory has a finite capacity, and that instructional design should minimise extraneous load — the mental effort caused by poor presentation — while maximising germane load, the effort devoted to schema formation.\n\nCounter-intuitively, redundancy effects suggest that adding extra explanatory text to a self-explanatory diagram can impair learning.",
    stem: "Based on the passage, which instructional strategy would most likely reduce cognitive load?",
    options: ["Providing both written and spoken explanations simultaneously.", "Including detailed captions alongside every diagram.", "Removing explanatory text from diagrams that are self-explanatory.", "Increasing the number of practice problems to build schemas faster."],
    correct: 2,
  },
  {
    id: 3, tag: "Easy", topic: "Writing",
    passage: "The following is a draft of a student essay about renewable energy.\n\n[1] Solar panels have become increasingly affordable over the past decade. [2] In 2010, the average cost per watt was over $4. [3] By 2023, that figure had fallen to under $0.30. [4] Despite this progress, many households still cannot afford upfront installation costs. [5] Government subsidies and low-interest loans have helped bridge this gap in some regions.",
    stem: "Which of the following best describes the function of sentence 4 in the context of the paragraph?",
    options: ["It introduces a counterargument that undermines the main claim.", "It acknowledges a limitation that qualifies the positive trend described.", "It provides a statistical comparison that supports the essay's thesis.", "It transitions to a new topic unrelated to solar panel costs."],
    correct: 1,
  },
  {
    id: 4, tag: "Medium", topic: "Writing",
    passage: "The following sentences are part of a student's argumentative essay.\n\nThe widespread adoption of electric vehicles (EVs) is essential for reducing urban air pollution. However, critics argue that EVs simply shift emissions from the tailpipe to the power plant. _______, studies show that even in regions with coal-heavy grids, EVs produce fewer lifecycle emissions than comparable petrol vehicles.",
    stem: "Which transition word or phrase best fills the blank to maintain the essay's argumentative logic?",
    options: ["In contrast", "Similarly", "Nevertheless", "For instance"],
    correct: 2,
  },
  {
    id: 5, tag: "Hard", topic: "Writing",
    passage: "Excerpt from a student essay on urban biodiversity.\n\nUrban ecosystems, once dismissed as ecological dead zones, are increasingly recognised as refuges for surprising diversity. Green roofs, street trees, and pocket parks create corridors that allow species to move through otherwise impermeable concrete landscapes.",
    stem: "Which sentence most effectively acknowledges a significant challenge facing urban biodiversity efforts?",
    options: ["Urban areas also have many museums and cultural attractions.", "However, invasive species introduced through global trade networks frequently outcompete native flora and fauna in urban settings.", "Green roofs are more expensive to install than conventional roofs.", "Biodiversity is important for ecosystems around the world."],
    correct: 1,
  },
  {
    id: 6, tag: "Easy", topic: "Math",
    passage: "",
    stem: "If 3x + 7 = 22, what is the value of x?",
    options: ["3", "5", "7", "9"],
    correct: 1,
  },
  {
    id: 7, tag: "Medium", topic: "Math",
    passage: "",
    stem: "A rectangle has a length that is twice its width. If the perimeter is 48 cm, what is the area?",
    options: ["64 cm²", "128 cm²", "96 cm²", "192 cm²"],
    correct: 1,
  },
  {
    id: 8, tag: "Hard", topic: "Math",
    passage: "",
    stem: "The function f(x) = x² − 6x + k has exactly one real root. What is the value of k?",
    options: ["3", "6", "9", "12"],
    correct: 2,
  },
  {
    id: 9, tag: "Easy", topic: "Reading",
    passage: "Adapted from a 2020 article on ocean plastics.\n\nEvery year, an estimated 8 million metric tons of plastic enter the world's oceans. Once at sea, plastics break down into microplastics — fragments smaller than 5 millimetres — which are ingested by marine organisms at every level of the food chain. Scientists have detected microplastics in fish sold at markets, in Arctic sea ice, and even in human blood.",
    stem: "According to the passage, which of the following is true about microplastics?",
    options: ["They are only found in tropical oceans.", "They have been detected in human blood.", "They are larger than 5 millimetres.", "They primarily affect deep-sea organisms."],
    correct: 1,
  },
];

export const QUESTIONS = Array.from({ length: TOTAL_QUESTIONS }, (_, i) => ({
  ...MOCK_QUESTIONS[i % MOCK_QUESTIONS.length],
  id: i,
}));

const TOPICS = [
  { name: "Reading", total: 12 },
  { name: "Writing", total: 10 },
  { name: "Math",    total: 8  },
];

export default function PracticeExamUI() {
  const [current, setCurrent]   = useState(0);
  const [answers, setAnswers]   = useState<Record<number, number>>({});
  const [flagged, setFlagged]   = useState<Set<number>>(new Set());
  const [seconds, setSeconds]   = useState(34 * 60 + 22);
  const [paused, setPaused]     = useState(false);
  const [showPanel, setShowPanel] = useState(false); // mobile right-panel toggle

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [paused]);

  const answered     = new Set(Object.keys(answers).map(Number));
  const mins         = Math.floor(seconds / 60);
  const secs         = seconds % 60;
  const timerDisplay = `${mins}:${secs.toString().padStart(2, "0")}`;
  const totalSecs    = 34 * 60 + 22;
  const timerPct     = Math.round((seconds / totalSecs) * 100);
  const avgPaceSecs  = answered.size > 0 ? Math.round((totalSecs - seconds) / answered.size) : 0;
  const avgPaceLabel = avgPaceSecs > 0 ? `${Math.floor(avgPaceSecs / 60)}m ${avgPaceSecs % 60}s / question` : "—";
  const progress     = Math.round((answered.size / TOTAL_QUESTIONS) * 100);
  const currentQ     = QUESTIONS[current];
  const selectedAnswer = answers[current] ?? null;
  const topicProgress = TOPICS.map(tp => {
    const topicQs = QUESTIONS.filter(q => q.topic === tp.name);
    const done = topicQs.filter(q => answered.has(q.id)).length;
    return { ...tp, done };
  });
 
  const isMath       = currentQ.topic === "Math";

const panelProps: RightPanelProps = {
  answered, flagged, current, seconds, totalSecs,
  timerDisplay, timerPct, avgPaceSecs, avgPaceLabel,
  topicProgress, getDotClass, setCurrent, setShowPanel,
}

  function selectOption(idx: number) { setAnswers(prev => ({ ...prev, [current]: idx })); }
  function navigate(dir: number) {
    const next = current + dir;
    if (next < 0 || next >= TOTAL_QUESTIONS) return;
    setCurrent(next);
  }
  function toggleFlag() {
    setFlagged(prev => { const n = new Set(prev); n.has(current) ? n.delete(current) : n.add(current); return n; });
  }
  function getDotClass(i: number) {
    if (i === current)    return "bg-indigo-600 text-white border-indigo-600";
    if (flagged.has(i))   return "bg-amber-400 text-white border-amber-400";
    if (answered.has(i))  return "bg-teal-500 text-white border-teal-500";
    return "bg-white text-slate-500 border-slate-200 hover:border-slate-300";
  }



  return (
    <div className="flex flex-col h-screen bg-[#0f172a] overflow-hidden">

      {/* ── Top Bar ── */}
      <div className="flex items-center px-3 sm:px-5 h-[52px] bg-[#111827] border-b border-white/[0.07] shrink-0 gap-2 sm:gap-4">
        {/* left */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-base">🎓</span>
          <span className="text-xs sm:text-sm font-bold text-white">SAT Practice</span>
          <span className="hidden sm:inline text-white/20 mx-1">·</span>
          {["Reading & Writing", "Mixed"].map((tab, i) => (
            <span key={tab} className={`hidden sm:inline text-[10px] ${i === 0 ? "text-white/60" : "text-white/30"}`}>{tab}</span>
          ))}
        </div>

        {/* center progress */}
        <div className="flex-1 flex flex-col items-center gap-0.5 px-2 sm:px-6">
          <span className="text-[9px] sm:text-[10px] text-white/40 font-mono">Q {answered.size} of {TOTAL_QUESTIONS}</span>
          <div className="w-full max-w-xs h-[3px] bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* right */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center gap-1 sm:gap-1.5 bg-white/[0.06] border border-white/[0.09] px-2 sm:px-3 py-1.5 rounded-full">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="#f59e0b" strokeWidth="1.3"/>
              <path d="M6 3v3l2 1.5" stroke="#f59e0b" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <span className="text-[10px] sm:text-xs font-bold text-amber-400 font-mono">{timerDisplay}</span>
          </div>
          <button onClick={() => setPaused(p => !p)}
            className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full border border-white/10 text-white/60 hover:text-white transition-all">
            <svg width="8" height="10" viewBox="0 0 8 10" fill="currentColor">
              {paused ? <path d="M1 1l6 4-6 4V1z"/> : <><rect x="0" y="0" width="3" height="10" rx="1"/><rect x="5" y="0" width="3" height="10" rx="1"/></>}
            </svg>
            {paused ? "Resume" : "Pause"}
          </button>
          {/* mobile progress button */}
          <button onClick={() => setShowPanel(p => !p)}
            className="sm:hidden flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-full border border-white/10 text-white/60">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="1" y="1" width="4" height="10" rx="1"/><rect x="7" y="1" width="4" height="6" rx="1"/>
            </svg>
          </button>
          <button className="text-[10px] font-bold px-3 sm:px-4 py-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
            End
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden gap-3 p-2 sm:p-3">

        {/* ── Left Card ── */}
        <div className="flex-1 bg-white rounded-2xl flex flex-col overflow-hidden shadow-sm min-w-0">

          {/* passage header */}
          <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[9px] sm:text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-md">
                {isMath ? "Math" : "Reading Comprehension"}
              </span>
              <span className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${
                currentQ.tag === "Easy"   ? "bg-green-50 text-green-700 border-green-200"
                : currentQ.tag === "Medium" ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-red-50 text-red-700 border-red-200"
              }`}>{currentQ.tag}</span>
            </div>
            <div className="flex items-center gap-1.5">
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
          </div>

          {/* scrollable content */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4">
            {!isMath && currentQ.passage && (
              <>
                <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Passage</p>
                <div className="space-y-2 mb-4 sm:mb-6">
                  {currentQ.passage.split("\n\n").map((para, idx) => (
                    <p key={idx} className={`text-[11px] sm:text-[12px] leading-relaxed ${idx === 0 ? "text-slate-400 italic" : "text-slate-600"}`}>
                      {para}
                    </p>
                  ))}
                </div>
              </>
            )}

            <div className={!isMath && currentQ.passage ? "border-t border-slate-100 pt-3 sm:pt-4" : ""}>
              <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Question {current + 1}</p>
              <p className="text-[12px] sm:text-[13px] font-semibold text-slate-800 leading-relaxed mb-3 sm:mb-4">
                {currentQ.stem}
              </p>
              <div className="space-y-1.5 sm:space-y-2">
                {currentQ.options.map((opt, i) => (
                  <button key={i} onClick={() => selectOption(i)}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border text-left transition-all ${
                      selectedAnswer === i ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/20"
                    }`}>
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center shrink-0 text-[10px] sm:text-[11px] font-bold transition-all ${
                      selectedAnswer === i ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 text-slate-400"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className={`text-[11px] sm:text-[12px] leading-relaxed ${selectedAnswer === i ? "text-indigo-800 font-medium" : "text-slate-600"}`}>
                      {opt}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* bottom nav */}
        {/* bottom nav */}
<div className="flex items-center justify-between px-3 sm:px-5 py-3 border-t border-slate-100 bg-white shrink-0 sticky bottom-0 z-10">
  <button
    onClick={() => navigate(-1)}
    disabled={current === 0}
    className="flex items-center gap-1.5 text-[11px] font-semibold px-4 py-2.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
  >
    ← Previous
  </button>
  <span className="text-[10px] text-slate-300 text-center px-2">
    {selectedAnswer === null ? "Select an answer" : ""}
  </span>
  <button
    onClick={() => navigate(1)}
    disabled={current === TOTAL_QUESTIONS - 1}
    className="flex items-center gap-1.5 text-[11px] font-semibold px-4 py-2.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
  >
    Next →
  </button>
</div>
        </div>

        {/* ── Right Card — desktop only ── */}
       <div className="hidden sm:flex w-64 shrink-0 rounded-2xl overflow-hidden shadow-sm">
  <div className="flex-1">
    <PracticeRightPanel {...panelProps} />
  </div>
</div>


      </div>

      {/* ── Mobile bottom sheet ── */}
      {showPanel && (
        <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end">
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
    </div>
  );
}