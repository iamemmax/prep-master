"use client";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, X, ArrowRight, BookOpen, ShieldCheck, ListChecks } from "lucide-react";
import { useAuth } from "@/context/authentication";
import { useTour } from "../../util/tour/TourContext";

export default function WelcomeModal() {
  const { welcomeOpen, closeWelcome, startTour } = useTour();
  const { authState: { user } } = useAuth();
  const firstName = user?.user?.first_name ?? "there";

  return (
    <Dialog open={welcomeOpen} onOpenChange={v => { if (!v) closeWelcome(); }}>
      <DialogContent
        showCloseButton={false}
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-0 gap-0 text-slate-900 dark:text-zinc-100 rounded-2xl overflow-hidden shadow-2xl"
        style={{ maxWidth: 480 }}
      >
        <div className="relative px-6 py-5 bg-linear-to-br from-amber-50 via-white to-orange-50 dark:from-amber-500/10 dark:via-zinc-900 dark:to-orange-500/10 border-b border-slate-100 dark:border-zinc-800">
          <button
            onClick={closeWelcome}
            aria-label="Close"
            className="absolute top-3 right-3 text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 p-1 rounded-md hover:bg-white/60 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#F7C948] text-[#5A3300] shadow-sm">
              <Sparkles size={20} fill="currentColor" />
            </span>
            <DialogTitle className="text-lg font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Welcome, {firstName}! 👋
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
            Take a 30-second tour so you know where everything lives. You can skip it and come back any time from Profile.
          </DialogDescription>
        </div>

        <div className="px-6 py-4">
          <ul className="space-y-2.5">
            <Highlight
              icon={<BookOpen size={13} className="text-[#2B7FFF]" />}
              title="Practice your way"
              body="Pick an exam, choose subjects, and set your own difficulty, timer, and question count."
            />
            <Highlight
              icon={<ShieldCheck size={13} className="text-emerald-500" />}
              title="Proctored sessions"
              body="Optional webcam monitoring for phones, multi-person, and gaze — kept on this device only."
            />
            <Highlight
              icon={<ListChecks size={13} className="text-[#F7C948]" />}
              title="Review every answer"
              body="Per-question explanations and filters by Wrong, Correct, or Skipped to drill into what matters."
            />
          </ul>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-slate-100 dark:border-zinc-800">
          <button
            onClick={closeWelcome}
            className="text-xs font-semibold px-3 h-9 rounded-md text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={() => startTour("dashboard")}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 h-9 rounded-md text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #FE9A00, #FF6900)" }}
          >
            Take the tour
            <ArrowRight size={12} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Highlight({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <li className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800">
      <span className="w-7 h-7 rounded-md bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">{title}</p>
        <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">{body}</p>
      </div>
    </li>
  );
}
