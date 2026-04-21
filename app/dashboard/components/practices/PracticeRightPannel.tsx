
// ── outside PracticeExamUI ──────────────────────────────────────────────────
export interface RightPanelProps {
  answered: Set<number>;
  flagged: Set<number>;
  current: number;
  total: number;
  seconds: number;
  totalSecs: number;
  timerDisplay: string;
  timerPct: number;
  avgPaceSecs: number;
  avgPaceLabel: string;
  topicProgress: { name: string; total: number; done: number }[];
  getDotClass: (i: number) => string;
  setCurrent: (i: number) => void;
  setShowPanel: (v: boolean) => void;
  onEnd: () => void;
}

const PracticeRightPanel =({
  answered, flagged, total, timerDisplay, timerPct,
  avgPaceSecs, avgPaceLabel, topicProgress, getDotClass,
  setCurrent, setShowPanel, onEnd,
}: RightPanelProps)=> {
  return (
    <div className="bg-white flex flex-col h-full overflow-hidden">
      {/* header */}
      <div className="px-4 pt-4 pb-2 border-b border-slate-100 shrink-0">
        <p className="text-xs font-bold text-slate-800 mb-0.5">Session Progress</p>
        <p className="text-[10px] text-slate-400 font-mono">SAT · Q {answered.size} of {total}</p>
      </div>

      {/* stats */}
      <div className="grid grid-cols-3 border-b border-slate-100 shrink-0">
        {[
          { value: answered.size,                   label: "Answered",  color: "text-slate-800" },
          { value: flagged.size,                    label: "Flagged",   color: "text-amber-500" },
          { value: total - answered.size, label: "Remaining", color: "text-slate-300" },
        ].map(({ value, label, color }, i) => (
          <div key={label} className={`px-3 py-3 ${i < 2 ? "border-r border-slate-100" : ""}`}>
            <p className={`text-xl font-bold leading-none ${color}`}>{value}</p>
            <p className="text-[9px] text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* navigator */}
      <div className="px-4 py-3 border-b border-slate-100 shrink-0">
        <p className="text-[10px] font-bold text-slate-700 mb-2">Question Navigator</p>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {[
            { color: "bg-teal-500",  label: "Answered"   },
            { color: "bg-amber-400", label: "Flagged"    },
            { color: "bg-slate-200", label: "Unanswered" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-sm ${color}`} />
              <span className="text-[8px] text-slate-400">{label}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-6 gap-1">
          {Array.from({ length: total }, (_, i) => (
            <button key={i} onClick={() => { setCurrent(i); setShowPanel(false); }}
              className={`w-8 h-8 rounded-lg text-[10px] font-semibold border transition-all hover:scale-110 ${getDotClass(i)}`}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* timer */}
      <div className="px-4 py-3 border-b border-slate-100 shrink-0">
        <p className="text-[10px] font-bold text-slate-700 mb-1">Time Remaining</p>
        <p className="text-2xl font-bold text-slate-800 font-mono mb-2">{timerDisplay}</p>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${timerPct > 50 ? "bg-[#894B00]" : timerPct > 20 ? "bg-amber-400" : "bg-red-500"}`}
            style={{ width: `${timerPct}%` }}
          />
        </div>
        {avgPaceSecs > 0 && (
          <div className="flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 5h8M5 1l4 4-4 4" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[9px] text-amber-500">Average pace: {avgPaceLabel}</span>
          </div>
        )}
      </div>

      {/* topics */}
      <div className="px-4 py-3 flex-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-700 mb-3">Topics this session</p>
        <div className="space-y-3">
          {topicProgress.map(tp => (
            <div key={tp.name}>
              <div className="flex justify-between mb-1">
                <span className="text-[11px] text-slate-600">{tp.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">{tp.done}/{tp.total}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#894B00] rounded-full transition-all"
                  style={{ width: tp.total > 0 ? `${Math.round((tp.done / tp.total) * 100)}%` : "0%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* end session */}
      <div className="p-4 border-t border-slate-100 shrink-0">
        <button onClick={onEnd} className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-[11px] font-semibold bg-red-50 hover:bg-red-100 transition-colors">
          End Session
        </button>
      </div>
    </div>
  );
}

export default PracticeRightPanel