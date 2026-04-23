"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, Crown, Sparkles, X, Zap } from "lucide-react";
import toast from "react-hot-toast";

type Cycle = "monthly" | "yearly" | "lifetime";

interface Plan {
  id: Cycle;
  label: string;
  priceNaira: number;
  unit: string;
  tagline: string;
  badge?: string;
  highlighted?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "monthly",
    label: "Monthly",
    priceNaira: 2000,
    unit: "/mo",
    tagline: "Try Premium flexibly",
  },
  {
    id: "yearly",
    label: "Yearly",
    priceNaira: 15000,
    unit: "/yr",
    tagline: "Save 37% vs monthly",
    badge: "Most popular",
    highlighted: true,
  },
  {
    id: "lifetime",
    label: "Lifetime",
    priceNaira: 30000,
    unit: "once",
    tagline: "Pay once, keep forever",
  },
];

const FEATURES = [
  "Unlimited practice attempts across all 17,000 questions",
  "All 6 exam categories unlocked (WAEC, JAMB, SAT, GRE, IELTS, TOEFL)",
  "Detailed per-topic performance analytics",
  "AI-assisted weakness detection and custom study plans",
  "Exam-day simulation with live proctoring",
  "Priority support",
];

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export default function UpgradeModal({
  open,
  onClose,
  onChoosePlan,
}: {
  open: boolean;
  onClose: () => void;
  onChoosePlan?: (planId: Cycle) => void;
}) {
  const [selected, setSelected] = useState<Cycle>("yearly");
  const [busy, setBusy] = useState(false);

  const choose = async (planId: Cycle) => {
    if (onChoosePlan) {
      onChoosePlan(planId);
      return;
    }
    // Default handler: backend checkout is not wired yet — surface a friendly
    // toast so the click clearly does something and capture the intent.
    setBusy(true);
    try {
      toast.success(`${PLANS.find(p => p.id === planId)?.label ?? "Plan"} selected — checkout coming soon. We'll email you when it launches.`);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-0 gap-0 text-slate-900 dark:text-zinc-100 rounded-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
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
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                  Upgrade to PrepMaster Premium
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                  Unlock every question, every exam, and every insight. Cancel anytime.
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-zinc-800 transition-colors shrink-0"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          {/* Plans */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            {PLANS.map(plan => {
              const isSelected = selected === plan.id;
              return (
                <button
                  key={plan.id}
                  onClick={() => setSelected(plan.id)}
                  className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-[#F7C948] bg-amber-50/50 dark:bg-amber-500/10 shadow-sm"
                      : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-2 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#F7C948] text-[#5A3300] uppercase tracking-wider">
                      {plan.badge}
                    </span>
                  )}
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    {plan.label}
                  </p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <p className="text-2xl font-black text-slate-900 dark:text-zinc-100 tabular-nums">
                      {formatNaira(plan.priceNaira)}
                    </p>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">{plan.unit}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2 leading-snug">
                    {plan.tagline}
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

          {/* Features list */}
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/50 p-4">
            <p className="text-[11px] uppercase tracking-wider font-bold text-slate-600 dark:text-zinc-400 mb-3 inline-flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#F7C948]" />
              What you unlock
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              {FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 text-xs text-slate-700 dark:text-zinc-300">
                  <Check size={13} className="text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={3} />
                  <span className="leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-3 border-t border-slate-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900">
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Secure checkout. Cancel anytime.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-xs font-semibold px-4 h-10 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Maybe later
            </button>
            <button
              onClick={() => choose(selected)}
              disabled={busy}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-5 h-10 rounded-lg text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
              style={{ background: "linear-gradient(135deg, #FE9A00, #FF6900)" }}
            >
              <Zap size={13} fill="currentColor" />
              Continue with {PLANS.find(p => p.id === selected)?.label}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
