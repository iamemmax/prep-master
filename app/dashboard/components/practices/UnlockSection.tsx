"use client";

import { useState } from "react";
import { Crown } from "lucide-react";
import UpgradeModal from "../upgrade/UpgradeModal";
import { useUserSubscription } from "../../util/apis/subscription/subscription";

export default function UnlockSectionBanner() {
  const [open, setOpen] = useState(false);
  const { data: subResp, isLoading } = useUserSubscription();

  // Hide the banner once the user has a valid subscription. We also keep it
  // hidden while the query is in flight so an already-subscribed user never
  // sees a stale "Upgrade" prompt flash on first paint.
  const isActiveSubscriber =
    !!subResp?.data?.is_subscribed && !!subResp?.data?.subscription?.is_valid;
  if (isLoading || isActiveSubscriber) return null;

  return (
    <div className="w-full rounded-[.875rem] border border-[#FEE685] dark:border-amber-500/30 bg-linear-to-tr from-[#FFFBEB] to-[#FFF7ED] dark:from-amber-500/10 dark:to-orange-500/10 px-6 py-8 mb-6 flex flex-col items-center text-center gap-4">

      {/* crown icon */}
      <div className="w-12 h-12 rounded-full  flex items-center justify-center">
        <Crown className="text-[#E17100]" size={30} />
      </div>

      {/* text */}
      <div>
        <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100 mb-1">
          Unlock All Exams with Premium
        </h3>
        <p className="text-sm text-slate-400 dark:text-zinc-400 max-w-xl leading-relaxed">
          Get unlimited access to all 17,000 questions across 6 exam categories. No limits, no restrictions.
        </p>
      </div>

      {/* button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-white text-sm font-bold px-8 py-3 rounded-xl transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-sm hover:shadow-md cursor-pointer"
        style={{ background: "linear-gradient(135deg, #FE9A00, #FF6900)" }}
      >
        <Crown size={18} />
        Upgrade to Premium
      </button>

      <UpgradeModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}