"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Check,
  Crown,
  Sparkles,
  X,
  Zap,
  BookOpen,
  Brain,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import { SmallSpinner } from "@/components/ui/Spinner";
import { formatAxiosErrorMessage } from "@/utils";
import { AxiosError } from "axios";
import {
  useSubscriptionPlans,
  useInitiatePayment,
  SubscriptionPlan,
} from "../../util/apis/subscription/subscription";

function formatPrice(amount: string, currency: string): string {
  const value = Number(amount);
  if (Number.isNaN(value)) return `${amount} ${currency}`;
  if (currency === "NGN") return `₦${value.toLocaleString("en-NG")}`;
  return `${currency} ${value.toLocaleString()}`;
}

function periodLabel(days: number): string {
  if (days >= 360) return "year";
  if (days >= 28) return "month";
  if (days >= 7) return "week";
  return `${days}d`;
}

function priceUnit(days: number): string {
  return `/${periodLabel(days)}`;
}

export default function UpgradeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: plansResp, isLoading: loadingPlans, error: plansError, refetch } = useSubscriptionPlans();
  const { mutate: initiate, isPending: initiating } = useInitiatePayment();

  const plans = plansResp?.data ?? [];
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Default to the first plan once they arrive (or to the highest-tier one if
  // we can spot it). Runs only when the plan list changes.
  useEffect(() => {
    if (selectedId != null) return;
    if (plans.length === 0) return;
    setSelectedId(plans[0].id);
  }, [plans, selectedId]);

  const selectedPlan: SubscriptionPlan | null =
    plans.find((p) => p.id === selectedId) ?? null;

  const handleContinue = () => {
    if (!selectedPlan) return;
    initiate(selectedPlan.id, {
      onSuccess: (res) => {
        const url = res?.data?.authorization_url;
        if (!url) {
          toast.error("Couldn't get checkout link. Please try again.");
          return;
        }
        // Hand off to Paystack — full-page redirect so the return URL
        // (configured server-side) lands back on /?referenceId=…
        window.location.href = url;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
        const message =
          error?.response?.data?.errors?.message ||
          error?.response?.data?.message ||
          formatAxiosErrorMessage(error as AxiosError) ||
          "Couldn't start checkout. Please try again.";
        toast.error(String(message));
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !initiating) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-0 gap-0 text-slate-900 dark:text-zinc-100 rounded-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl font-inter"
        style={{ maxWidth: 820 }}
      >
        {/* Hero */}
        <div className="relative px-6 py-5 border-b border-slate-100 dark:border-zinc-800 bg-linear-to-br from-[#FFFBEB] via-white to-[#FFF7ED] dark:from-amber-500/10 dark:via-zinc-900 dark:to-orange-500/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#F7C948] text-[#5A3300] shrink-0 shadow-sm">
                <Crown size={20} fill="currentColor" />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-sm sm:text-lg font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                  Upgrade to PrepMaster Premium
                </DialogTitle>
                <DialogDescription className="text-[11px] sm:text-xs text-slate-600 dark:text-zinc-400 mt-0.5 leading-snug">
                  Unlock every question, every exam, and every insight. Cancel anytime.
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={initiating}
              className="text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-zinc-800 transition-colors shrink-0 disabled:opacity-50"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Plans */}
          {loadingPlans ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : plansError ? (
            <div className="rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/60 dark:bg-rose-500/5 p-4 flex items-start gap-3">
              <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">Couldn&apos;t load plans</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Check your connection and try again.</p>
              </div>
              <button
                onClick={() => refetch()}
                className="shrink-0 inline-flex items-center text-[11px] font-semibold px-3 h-8 rounded-md border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-white/60 dark:hover:bg-rose-500/10 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : plans.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-900/40 p-6 text-center">
              <p className="text-sm text-slate-500 dark:text-zinc-400">No plans available right now.</p>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 gap-3 ${
                plans.length === 1
                  ? ""
                  : plans.length === 2
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-3"
              }`}
            >
              {plans.map((plan) => {
                const isSelected = selectedId === plan.id;
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedId(plan.id)}
                    className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-[#F7C948] bg-amber-50/50 dark:bg-amber-500/10 shadow-sm"
                        : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      {plan.name}
                      {plan.tier && plan.tier !== plan.name.toLowerCase() && (
                        <span className="ml-1.5 normal-case font-medium text-slate-400 dark:text-zinc-500">
                          · {plan.tier}
                        </span>
                      )}
                    </p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tabular-nums">
                        {formatPrice(plan.price, plan.currency)}
                      </p>
                      <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400">
                        {priceUnit(plan.duration_days)}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 mt-1.5 sm:mt-2 leading-snug line-clamp-2">
                      {plan.description}
                    </p>
                    {isSelected && (
                      <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#F7C948] text-[#5A3300] flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Allocation panel — updates with selected plan */}
          {selectedPlan && (
            <div className="rounded-xl border border-amber-200/60 dark:border-amber-500/20 bg-linear-to-br from-amber-50 via-white to-orange-50 dark:from-amber-500/5 dark:via-zinc-900 dark:to-orange-500/5 p-4">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <p className="text-[11px] uppercase tracking-wider font-bold text-slate-700 dark:text-zinc-300 inline-flex items-center gap-1.5">
                  <Zap size={12} className="text-[#F7C948]" fill="currentColor" />
                  Your {selectedPlan.name} allocation
                </p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                  Refreshes every {periodLabel(selectedPlan.duration_days)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 p-3">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#F7C948]/15 text-[#B45309] dark:text-[#F7C948]">
                    <BookOpen size={15} strokeWidth={2.2} />
                  </div>
                  <p className="mt-2.5 text-base sm:text-xl font-black tabular-nums text-slate-900 dark:text-zinc-100 tracking-tight">
                    {selectedPlan.question_limit.toLocaleString("en-NG")}
                  </p>
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-zinc-200 leading-tight">
                    Practice questions
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    per {periodLabel(selectedPlan.duration_days)}
                  </p>
                </div>
                <div className="rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 p-3">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#F7C948]/15 text-[#B45309] dark:text-[#F7C948]">
                    <Brain size={15} strokeWidth={2.2} />
                  </div>
                  <p className="mt-2.5 text-base sm:text-xl font-black tabular-nums text-slate-900 dark:text-zinc-100 tracking-tight">
                    {selectedPlan.ai_credits.toLocaleString("en-NG")}
                  </p>
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-zinc-200 leading-tight">
                    AI credits
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    per {periodLabel(selectedPlan.duration_days)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Features list — pulled directly from the selected plan */}
          {selectedPlan && selectedPlan.features.length > 0 && (
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/50 p-4">
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-600 dark:text-zinc-400 mb-3 inline-flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#F7C948]" />
                What you unlock
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
                {selectedPlan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="grid place-items-center w-5 h-5 rounded-full bg-[#F7C948]/20 text-[#B45309] dark:text-[#F7C948] shrink-0 mt-0.5">
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <span className="text-[11px] sm:text-xs text-slate-700 dark:text-zinc-300 leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer — stacks vertically on mobile so the buttons get full width
            instead of getting squeezed by the secure-checkout note. */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-3 border-t border-slate-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900">
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 text-center sm:text-left">
            Secure Paystack checkout. Cancel anytime.
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              disabled={initiating}
              className="flex-1 sm:flex-none text-[11px] sm:text-xs font-semibold px-3 sm:px-4 h-10 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              Maybe later
            </button>
            <button
              onClick={handleContinue}
              disabled={!selectedPlan || initiating}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold px-3 sm:px-5 h-10 rounded-lg text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 whitespace-nowrap"
              style={{ background: "linear-gradient(135deg, #FE9A00, #FF6900)" }}
            >
              {initiating ? (
                <><SmallSpinner /> Redirecting…</>
              ) : selectedPlan ? (
                <>
                  <Zap size={13} fill="currentColor" />
                  <span className="sm:hidden">Continue</span>
                  <span className="hidden sm:inline">Continue with {selectedPlan.name}</span>
                </>
              ) : (
                <>Continue</>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
