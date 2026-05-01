"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import {
  useVerifyPayment,
  useInvalidateUserSubscription,
} from "@/app/dashboard/util/apis/subscription/subscription";

/**
 * Mounts on the marketing home page. When Paystack redirects the user back
 * with `?referenceId=...`, this component takes over the screen with an
 * overlay, calls the verify endpoint, then shows success / failure with a
 * button to continue. The query param is stripped once verification settles
 * so the user can't accidentally re-trigger it on refresh.
 */
export default function PaymentVerification() {
  const params = useSearchParams();
  const router = useRouter();
  // Strip any trailing slash so a stray "?referenceId=abc/" still resolves.
  const reference = params.get("referenceId")?.replace(/\/+$/, "") || null;

  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(!!reference);
  }, [reference]);

  const { data, isLoading, error } = useVerifyPayment(open ? reference : null);
  const invalidateUserSub = useInvalidateUserSubscription();

  const paymentStatus = data?.data?.payment_status;
  const subscription = data?.data?.subscription;
  const isSuccess = !error && paymentStatus === "success";
  const isFailed = !!error || (!!paymentStatus && paymentStatus !== "success");

  // When verification confirms a new active plan, bust the user-subscription
  // cache so the dashboard reflects the upgrade as soon as the user navigates.
  useEffect(() => {
    if (isSuccess && subscription) {
      invalidateUserSub();
    }
  }, [isSuccess, subscription, invalidateUserSub]);

  if (!open || !reference) return null;

  const clearAndClose = () => {
    setOpen(false);
    // Drop the referenceId from the URL so a refresh doesn't re-verify.
    router.replace("/", { scroll: false });
  };

  const goToDashboard = () => {
    setOpen(false);
    router.replace("/dashboard");
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
        {isLoading && (
          <div className="px-6 py-8 text-center">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/10 text-[#F7C948] mb-4">
              <Loader2 size={22} className="animate-spin" />
            </span>
            <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
              Verifying your payment…
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
              Hang tight — this usually takes a few seconds. Please don&apos;t close this page.
            </p>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-3 tabular-nums">
              Ref: {reference}
            </p>
          </div>
        )}

        {isSuccess && (
          <div className="px-6 py-7 text-center">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
              <CheckCircle2 size={24} strokeWidth={2.4} />
            </span>
            <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
              Payment successful
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
              {subscription
                ? `${subscription.plan.name} is now active. ${subscription.days_remaining} day${subscription.days_remaining === 1 ? "" : "s"} remaining and ${subscription.ai_credits_remaining} AI credit${subscription.ai_credits_remaining === 1 ? "" : "s"} on your account.`
                : "Your subscription is now active."}
            </p>
            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                onClick={clearAndClose}
                className="text-xs font-semibold px-4 h-9 rounded-md text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Stay here
              </button>
              <button
                onClick={goToDashboard}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 h-9 rounded-md bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors"
              >
                Go to dashboard
              </button>
            </div>
          </div>
        )}

        {isFailed && !isLoading && (
          <div className="px-6 py-7 text-center">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 mb-4">
              <AlertTriangle size={22} />
            </span>
            <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
              We couldn&apos;t confirm your payment
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
              {paymentStatus && paymentStatus !== "success"
                ? `Status returned by Paystack: ${paymentStatus}.`
                : "There was a problem reaching our servers."}{" "}
              If you were charged, contact support with the reference below.
            </p>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2 tabular-nums break-all">
              Ref: {reference}
            </p>
            <button
              onClick={clearAndClose}
              className="mt-5 inline-flex items-center text-xs font-semibold px-4 h-9 rounded-md border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
