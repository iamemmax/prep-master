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
  const btnLabel = isPremiumLocked
    ? "Upgrade to Access"
    : exam.started
    ? "Continue Practice"
    : "Start Practice";

  const btnStyle: React.CSSProperties = isPremiumLocked
    ? { background: "linear-gradient(135deg, #FE9A00, #FF6900)", color: "#fff", }
    : exam.started
    ? { background: "#4E49F6", color: "#fff", }
    : { background: "#fff", color: "#4E49F6", border: "1px solid #E2E8F0" };

    const handleStart = ()=>{
      if(btnLabel === "Start Practice" ){
        onStart()
      }else if(btnLabel === "Continue Practice"){
        router.push("/dashboard/practice/start-practice")
      }
    }
  return (
    <div className={`bg-white rounded-[.875rem] cursor-pointer border py-4 flex flex-col gap-3 transition-all duration-200 hover:shadow-md border-[#E2E8F0]`}>

      {/* Name + badge + description */}
      <div className="px-4  border-b border-[#EEF0F4] pb-3">
        <div className="flex items-center justify-between gap-2 mb-0.5 ">
          <h3 className="text-sm font-bold text-slate-900">{exam.name}</h3>
          {exam.badge && (
            <span className={`text-[10px] font-semibold px-3 py-1 font-inter rounded-full shrink-0 ${getBadgeClass(exam.badge)}`}>
              {exam.badge}
            </span>
          )}
        </div>
        <p className="text-xs font-inter text-[#99A1B2] leading-snug">{exam.description}</p>
      </div>

      {/* Stats — 4 cols */}
      <div className="grid grid-cols-4 i border-b border-[#EEF0F4] pb-3 px-4 gap-2">
        {[
          { value: exam.questions.toLocaleString(), label: "Questions"  },
          { value: exam.topics,                     label: "Topics"     },
          { value: exam.difficulty,                 label: "Difficulty" },
          { value: exam.freeAccess,                 label: "Free access"},
        ].map(({ value, label }) => (
          <div key={label} className="mt-1.25">
            <p className="text-sm  text-[#0F172B] font-semibold font-inter leading-none">{value}</p>
            <p className="text-[.6875rem] font-inter text-[#99A1B2] mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Progress / status */}
      <div className="flex-1 px-4">
        {exam.started && !isPremiumLocked ? (
          <div>
            <div className="flex justify-between  font-inter text-[10px] text-slate-400 mb-1">
              <span>Your progress</span>
              <span className="font-semibold text-xs text-[#4E49F6]">{exam.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${exam.progress}%`, background: "#4E49F6" }}
              />
            </div>
            {exam.lastScore !== null && (
              <p className="text-[10px] text-slate-400 mt-1">
                Last score: <span className="font-semibold text-[#99A1B2]">{exam.lastScore}%</span>
              </p>
            )}
          </div>
        ) : isPremiumLocked ? (
          <p className="text-[10px] text-amber-600 font-medium">
            🔒 Premium — upgrade to unlock all questions
          </p>
        ) : (
          <p className="text-[10px] text-slate-400">
            Not started · {exam.freeAccess} free questions ready
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="px-4">
      <button
        className="w-full py-3 mt-3 rounded-[.625rem] cursor-pointer text-xs font-inter font-bold transition-all hover:opacity-90"
        style={btnStyle}
        onClick={handleStart}
      >
        {btnLabel}
      </button>

      </div>
    </div>
  );
};

export default ExamCard;