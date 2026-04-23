"use client";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import PredictedScore from "../components/practices/PredictedScore";
import MistakeRadar from "../components/practices/MistakeRadar";
import MemoryRefresh from "../components/practices/MemoryRefresh";
import ProgressKpis from "../components/progress/ProgressKpis";
import StudyHeatmap from "../components/progress/StudyHeatmap";
import TopicMasteryGrid from "../components/progress/TopicMasteryGrid";
import AccuracyTrend from "../components/progress/AccuracyTrend";
import TimeAnalytics from "../components/progress/TimeAnalytics";
import Achievements from "../components/progress/Achievements";
import CoachProgressPanel from "../components/coach/CoachProgressPanel";
import { ProgressInsightRequest } from "../util/ai/types";
import { TourAutoStart } from "../util/tour/TourContext";

// Placeholder request — backend will compute the real trend values from the
// user's session history. Typed here so the component gets realistic mock
// copy during UI dev.
const PROGRESS_REQUEST: ProgressInsightRequest = {
  accuracyTrend: "increasing",
  avgTimeTrend: "flat",
  strongTopics: ["Algebra", "Reading comprehension"],
  weakTopics: ["Geometry", "Data interpretation"],
  consistency: "medium",
};

export default function ProgressPage() {
  return (
    <div className="bg-slate-50 dark:bg-zinc-950 font-inter min-h-screen text-slate-900 dark:text-zinc-100">
      <DashboardHeader />

      <main className="max-w-400 mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <header className="mb-6 pb-5 border-b border-slate-200 dark:border-zinc-800">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-medium">Report</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-zinc-100 tracking-tight mt-1">Performance &amp; progress</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
            A running view of your practice results, retention, and projected exam outcome — updated after every session.
          </p>
        </header>

        <TourAutoStart tourId="progress" />

        <SectionLabel title="Summary" />
        <div data-tour="progress-kpis">
          <ProgressKpis />
        </div>

        <SectionLabel title="AI insight" />
        <div data-tour="progress-ai" className="mb-8">
          <CoachProgressPanel request={PROGRESS_REQUEST} />
        </div>

        <SectionLabel title="Exam projection" />
        <PredictedScore />

        <SectionLabel title="Weak areas &amp; retention" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          <MistakeRadar />
          <MemoryRefresh />
        </div>

        <SectionLabel title="Accuracy &amp; response time" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          <AccuracyTrend />
          <TimeAnalytics />
        </div>

        <SectionLabel title="Practice consistency" />
        <div className="mb-8">
          <StudyHeatmap />
        </div>

        <SectionLabel title="Content mastery" />
        <div data-tour="progress-mastery" className="mb-8">
          <TopicMasteryGrid />
        </div>

        <SectionLabel title="Milestones" />
        <div className="mb-12">
          <Achievements />
        </div>
      </main>
    </div>
  );
}

function SectionLabel({ title }: { title: string }) {
  return (
    <h2
      className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-semibold mb-3"
      dangerouslySetInnerHTML={{ __html: title }}
    />
  );
}
