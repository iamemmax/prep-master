"use client"
import { useRouter } from "next/navigation";
import { Exam, getBadgeClass } from "../../practice/page";

interface ExamCardProps {
  exam: Exam;
  isPremiumLocked: boolean;
  onStart: () => void;
}

const ExamCard = ({ exam, isPremiumLocked,onStart }: ExamCardProps) => {
  const router = useRouter()
  const canContinue = !isPremiumLocked && exam?.sessionId != null;
  const btnLabel = isPremiumLocked
    ? "Upgrade to Access"
    : canContinue
    ? "Continue Practice"
    : "Start Practice";

  const btnStyle: React.CSSProperties = isPremiumLocked
    ? { background: "linear-gradient(135deg, #FE9A00, #FF6900)", color: "#fff", }
    : canContinue
    ? { background: "#F7C948", color: "#fff", }
    : {};
  const btnClass = !isPremiumLocked && !canContinue
    ? "bg-white dark:bg-zinc-800 text-[#F7C948] border border-[#E2E8F0] dark:border-zinc-700"
    : "";

    const handleStart = ()=>{
      if(isPremiumLocked) return
      if(canContinue){
        router.push(`/dashboard/practice/start-practice/${exam.sessionId}`)
        return
      }
      onStart()
    }
    // console.log(exam);
    
  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-[.875rem] cursor-pointer border py-4 flex flex-col gap-3 h-full transition-all duration-200 hover:shadow-md border-[#E2E8F0] dark:border-zinc-800`}>

      {/* Name + badge + description */}
      <div className="px-4  border-b border-[#EEF0F4] dark:border-zinc-800 pb-3">
        <div className="flex items-center justify-between gap-2 mb-0.5 ">
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{exam.name}</h3>
          {exam.badge && (
            <span className={`text-[10px] font-semibold px-3 py-1 font-inter rounded-full shrink-0 ${getBadgeClass(exam.badge)}`}>
              {exam.badge}
            </span>
          )}
        </div>
        <p className="text-xs font-inter text-[#99A1B2] dark:text-zinc-400 leading-snug">{exam.description}</p>
      </div>

      {/* Stats — 4 cols */}
      <div className="grid grid-cols-4 i border-b border-[#EEF0F4] dark:border-zinc-800 pb-3 px-4 gap-2">
        {[
          { value: exam.questions.toLocaleString(), label: "Questions"  },
          { value: exam.topics,                     label: "Topics"     },
          { value: exam.difficulty,                 label: "Difficulty" },
          { value: exam.freeAccess,                 label: "Free access"},
        ].map(({ value, label }) => (
          <div key={label} className="mt-1.25">
            <p className="text-sm  text-[#0F172B] dark:text-zinc-100 font-semibold font-inter leading-none">{value}</p>
            <p className="text-[.6875rem] font-inter text-[#99A1B2] dark:text-zinc-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Progress / status */}
      <div className="flex-1 px-4">
        {exam.started && !isPremiumLocked ? (
          <div>
            <div className="flex justify-between  font-inter text-[10px] text-slate-400 dark:text-zinc-500 mb-1">
              <span>Your progress</span>
              <span className="font-semibold text-xs text-[#894B00]">{exam.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${exam.progress}%`, background: "#F7C948" }}
              />
            </div>
            {exam.lastScore !== null && (
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                Last score: <span className="font-semibold text-[#99A1B2]">{exam.lastScore}%</span>
              </p>
            )}
          </div>
        ) : isPremiumLocked ? (
          <p className="text-[10px] text-amber-600 font-medium">
            🔒 Premium — upgrade to unlock all questions
          </p>
        ) : (
          <p className="text-[10px] text-slate-400 dark:text-zinc-500">
            Not started · {exam.freeAccess} free questions ready
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="px-4">
      <button
        className={`w-full py-3 mt-3 rounded-[.625rem] text-xs font-inter font-bold transition-all ${btnClass} ${isPremiumLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:opacity-90"}`}
        style={btnStyle}
        onClick={handleStart}
        disabled={isPremiumLocked}
        aria-disabled={isPremiumLocked}
      >
        {btnLabel}
      </button>

      </div>
    </div>
  );
};

export default ExamCard;
