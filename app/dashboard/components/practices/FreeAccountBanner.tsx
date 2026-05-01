"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import UpgradeModal from "../upgrade/UpgradeModal";
import { useUserSubscription } from "../../util/apis/subscription/subscription";

const FreeAccountBanner = () => {
  const [open, setOpen] = useState(false);
  const { data: subResp, isLoading } = useUserSubscription();

  // Hide the banner once the user has a valid subscription. Also stay hidden
  // while the query is in flight so subscribers never see a stale "Free
  // Account" prompt flash before the data lands.
  const isActiveSubscriber =
    !!subResp?.data?.is_subscribed && !!subResp?.data?.subscription?.is_valid;
  if (isLoading || isActiveSubscriber) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 mb-6">
      <span className="shrink-0 h-8 w-8 bg-[#F7C948] flex justify-center items-center rounded-[.625rem]">
        <Info />
      </span>
      <p className="text-sm text-[#314158] dark:text-zinc-300 font-inter font-semibold">
        <strong>Free Account:</strong> You have access to 50 questions per exam.{" "}
        <button
          onClick={() => setOpen(true)}
          className="text-[#F7C948] cursor-pointer font-inter font-semibold hover:underline"
        >
          Upgrade to Premium
        </button>{" "}
        for unlimited access to all 17,000 questions.
      </p>
      <UpgradeModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
};
export default FreeAccountBanner;