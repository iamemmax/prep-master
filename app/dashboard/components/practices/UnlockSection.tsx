import { Crown } from "lucide-react";

export default function UnlockSectionBanner() {
  return (
    <div className="w-full rounded-[.875rem] border border-[#FEE685] bg-linear-to-tr from-[#FFFBEB] to-[#FFF7ED] px-6 py-8 mb-6 flex flex-col items-center text-center gap-4">
      
      {/* crown icon */}
      <div className="w-12 h-12 rounded-full  flex items-center justify-center">
        <Crown className="text-[#E17100]" size={30} />
      </div>

      {/* text */}
      <div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          Unlock All Exams with Premium
        </h3>
        <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
          Get unlimited access to all 17,000 questions across 6 exam categories. No limits, no restrictions.
        </p>
      </div>

      {/* button */}
      <button
        className="flex items-center gap-2 text-white text-sm font-bold px-8 py-3 rounded-xl transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
        style={{ background: "linear-gradient(135deg, #FE9A00, #FF6900)" }}
      >
         <Crown  size={18} />
        Upgrade to Premium
      </button>

    </div>
  );
}