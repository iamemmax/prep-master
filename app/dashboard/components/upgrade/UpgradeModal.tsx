"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Check,
  Crown,
  Sparkles,
  X,
  Zap,
  BookOpen,
  Brain,
  Plus,
  Library,
  Layers,
  LineChart,
  Wand2,
  Target,
} from "lucide-react";
import toast from "react-hot-toast";

type Cycle = "weekly" | "monthly" | "yearly";

interface Plan {
  id: Cycle;
  label: string;
  priceNaira: number;
  unit: string;
  tagline: string;
  badge?: string;
  // Credits for this billing period
  questions: number;
  aiCredits: number;
  // Used in the allocation panel ("per week", "per month", "per year")
  periodNoun: "week" | "month" | "year";
}

const PLANS: Plan[] = [
  {
    id: "weekly",
    label: "Weekly",
    priceNaira: 800,
    unit: "/week",
    tagline: "Best for short prep",
    questions: 500,
    aiCredits: 50,
    periodNoun: "week",
  },
  {
    id: "monthly",
    label: "Monthly",
    priceNaira: 2500,
    unit: "/month",
    tagline: "Most flexible",
    questions: 2000,
    aiCredits: 200,
    periodNoun: "month",
  },
  {
    id: "yearly",
    label: "Yearly",
    priceNaira: 18900,
    unit: "/year",
    tagline: "≈ ₦1,575/month",
    badge: "Save 37%",
    questions: 30000,
    aiCredits: 3000,
    periodNoun: "year",
  },
];

const FEATURES = [
  {
    icon: Library,
    label: "Full question bank",
    sub: "Every question, no daily caps",
  },
  {
    icon: Layers,
    label: "All exam categories",
    sub: "Every test we support",
  },
  {
    icon: LineChart,
    label: "Smart analytics",
    sub: "Per-topic strengths & gaps",
  },
  {
    icon: Wand2,
    label: "AI study coach",
    sub: "Adaptive practice plans",
  },
  {
    icon: Target,
    label: "Mock exam mode",
    sub: "Real timing, real pressure",
  },
];

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-NG");
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

  const selectedPlan = PLANS.find(p => p.id === selected) ?? PLANS[1];

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
              className="text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-zinc-800 transition-colors shrink-0"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Plans */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    {plan.label}
                  </p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tabular-nums">
                      {formatNaira(plan.priceNaira)}
                    </p>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400">{plan.unit}</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 mt-1.5 sm:mt-2 leading-snug tabular-nums">
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

          {/* Allocation panel — updates with selected plan */}
          <div className="rounded-xl border border-amber-200/60 dark:border-amber-500/20 bg-linear-to-br from-amber-50 via-white to-orange-50 dark:from-amber-500/5 dark:via-zinc-900 dark:to-orange-500/5 p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-700 dark:text-zinc-300 inline-flex items-center gap-1.5">
                <Zap size={12} className="text-[#F7C948]" fill="currentColor" />
                Your {selected} allocation
              </p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                Refreshes every {selectedPlan.periodNoun}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 p-3">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#F7C948]/15 text-[#B45309] dark:text-[#F7C948]">
                  <BookOpen size={15} strokeWidth={2.2} />
                </div>
                <p className="mt-2.5 text-base sm:text-xl font-black tabular-nums text-slate-900 dark:text-zinc-100 tracking-tight">
                  {formatNumber(selectedPlan.questions)}
                </p>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-zinc-200 leading-tight">
                  Practice questions
                </p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  per {selectedPlan.periodNoun}
                </p>
              </div>
              <div className="rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 p-3">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#F7C948]/15 text-[#B45309] dark:text-[#F7C948]">
                  <Brain size={15} strokeWidth={2.2} />
                </div>
                <p className="mt-2.5 text-base sm:text-xl font-black tabular-nums text-slate-900 dark:text-zinc-100 tracking-tight">
                  {formatNumber(selectedPlan.aiCredits)}
                </p>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-zinc-200 leading-tight">
                  AI credits
                </p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  per {selectedPlan.periodNoun}
                </p>
              </div>
            </div>
          </div>

          {/* Top-up callout */}
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-950/50 px-4 py-3">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-slate-900 dark:bg-zinc-100 text-[#F7C948] dark:text-[#5A3300] shrink-0">
              <Plus size={14} strokeWidth={3} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-semibold text-slate-900 dark:text-zinc-100">
                Run out before your next refresh? Top up anytime.
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed mt-0.5">
                Buy extra question or AI credits without changing your plan.
              </p>
            </div>
          </div>

          {/* Features list */}
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/50 p-4">
            <p className="text-[11px] uppercase tracking-wider font-bold text-slate-600 dark:text-zinc-400 mb-3 inline-flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#F7C948]" />
              What you unlock
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              {FEATURES.map(f => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="flex items-start gap-2.5">
                    <span className="grid place-items-center w-7 h-7 rounded-lg bg-[#F7C948]/15 text-[#B45309] dark:text-[#F7C948] shrink-0">
                      <Icon size={13} strokeWidth={2} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] sm:text-xs font-semibold text-slate-900 dark:text-zinc-100 leading-tight">
                        {f.label}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 leading-snug mt-0.5">
                        {f.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-3 border-t border-slate-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900">
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400">
            Secure checkout. Cancel anytime.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-[11px] sm:text-xs font-semibold px-3 sm:px-4 h-9 sm:h-10 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Maybe later
            </button>
            <button
              onClick={() => choose(selected)}
              disabled={busy}
              className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-3 sm:px-5 h-9 sm:h-10 rounded-lg text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
              style={{ background: "linear-gradient(135deg, #FE9A00, #FF6900)" }}
            >
              <Zap size={13} fill="currentColor" />
              Continue with {selectedPlan.label}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}