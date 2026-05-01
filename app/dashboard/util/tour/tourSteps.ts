// Copy and target selectors for every contextual tour in the app.
// Each page that wants to guide a first-time visitor gets its own tour.
import { isProductionGated } from "@/components/shared/coming-soon-gate";

export interface TourStep {
  id: string;
  target: string;            // `[data-tour="..."]` selector
  title: string;
  body: string;
  placement?: "bottom" | "top" | "left" | "right" | "auto";
  route?: string;            // navigate before showing this step
  /**
   * Step describes a feature that is hidden behind the production
   * coming-soon gate. Excluded from TOURS at module load when
   * isProductionGated() is true so the spotlight never lands on an
   * invisible target in prod.
   */
  mvpGated?: boolean;
}

export type TourId =
  | "dashboard"
  | "practice"
  | "session"
  | "review"
  | "progress"
  | "profile";

interface TourMeta {
  title: string;
  subtitle: string;
  /** Entire tour describes gated functionality. Hidden in prod. */
  mvpGated?: boolean;
}

const RAW_TOUR_META: Record<TourId, TourMeta> = {
  dashboard: { title: "Dashboard tour",  subtitle: "30s — where everything lives" },
  practice:  { title: "Practice tour",   subtitle: "How to start a session" },
  session:   { title: "Exam-room tour",  subtitle: "Navigating an active session" },
  review:    { title: "Review tour",     subtitle: "Learning from your answers" },
  progress:  { title: "Progress tour",   subtitle: "Reading your long-term trends", mvpGated: true },
  profile:   { title: "Profile tour",    subtitle: "Settings, reports, and preferences" },
};

const RAW_TOURS: Record<TourId, TourStep[]> = {
  dashboard: [
    {
      id: "stats",
      target: '[data-tour="dashboard-stats"]',
      title: "Your stats at a glance",
      body: "Score, questions answered, attempts, streak — these update every time you finish a session.",
      route: "/dashboard",
    },
    {
      id: "ai-coach",
      target: '[data-tour="dashboard-coach"]',
      title: "Your AI coach",
      body: "A personal nudge based on your recent performance. Shows what to focus on today and the one action that'll move the needle.",
      route: "/dashboard",
      mvpGated: true,
    },
    {
      id: "countdown",
      target: '[data-tour="exam-countdown"]',
      title: "Exam countdown",
      body: "Days left, readiness, target score — right next to the AI plan so you always know where you stand.",
      route: "/dashboard",
    },
    {
      id: "recent",
      target: '[data-tour="recent-tests"]',
      title: "Recent practice tests",
      body: "Your last sessions with a colored stripe by score tier. Tap any card to resume or review it.",
      route: "/dashboard",
    },
    {
      id: "practice-nav",
      target: '[data-tour="nav-practice"]',
      title: "Browse exams & start sessions",
      body: "Hit Practice to pick an exam, configure a session, and go.",
      route: "/dashboard",
    },
    {
      id: "progress-nav",
      target: '[data-tour="nav-progress"]',
      title: "Long-term progress",
      body: "Accuracy trends, topic mastery, and an AI analysis of your patterns over time. Check in weekly.",
      route: "/dashboard",
      mvpGated: true,
    },
    {
      id: "upgrade",
      target: '[data-tour="header-upgrade"]',
      title: "Unlock everything",
      body: "Premium opens all 17,000 questions, advanced analytics, and priority AI coaching.",
      route: "/dashboard",
    },
  ],

  practice: [
    {
      id: "practice-list",
      target: '[data-tour="practice-list"]',
      title: "Available exams",
      body: "Every exam we support. Premium ones show a crown; free ones unlock 50 questions without a plan.",
      route: "/dashboard/practice",
    },
    {
      id: "practice-filters",
      target: '[data-tour="practice-filters"]',
      title: "Filter and search",
      body: "Narrow by category, access tier, or type a name. Your filters stick until you clear them.",
      route: "/dashboard/practice",
    },
    {
      id: "practice-intake",
      target: '[data-tour="practice-intake"]',
      title: "Custom practice from a prompt",
      body: "Paste a syllabus, describe what you want, or upload a doc — we'll spin up a tailored session. (Premium.)",
      route: "/dashboard/practice",
      mvpGated: true,
    },
    {
      id: "practice-card",
      target: '[data-tour="practice-card"]',
      title: "Start a session",
      body: "Click any card to open Session Setup — pick questions, difficulty, timer, specific subjects, and proctoring.",
      route: "/dashboard/practice",
    },
  ],

  session: [
    {
      id: "session-header",
      target: '[data-tour="session-header"]',
      title: "The session header",
      body: "Timer (for timed mode), pause/resume, calculator, and theme toggle sit here. The End button finishes the session early.",
    },
    {
      id: "session-question",
      target: '[data-tour="session-question"]',
      title: "Answer, eliminate, flag",
      body: "Click an option to pick it. Hover and press × to eliminate a wrong option. Tap Flag to come back later.",
    },
    {
      id: "session-confidence",
      target: '[data-tour="session-confidence"]',
      title: "Track your confidence",
      body: "After you pick, rate how confident you are. The AI coach uses this to flag guesses you got lucky on.",
    },
    {
      id: "session-proctor",
      target: '[data-tour="session-proctor"]',
      title: "Proctoring panel",
      body: "If proctoring is on, this monitors for phones, extra people, and when your face leaves frame. Fully local — no upload.",
    },
    {
      id: "session-footer",
      target: '[data-tour="session-footer"]',
      title: "Navigate questions",
      body: "Dots let you jump to any question; Prev/Next step through in order. On the last question, Next becomes Finish.",
    },
  ],

  review: [
    {
      id: "review-filters",
      target: '[data-tour="review-filters"]',
      title: "Filter what matters",
      body: "Starts on All. Switch to Wrong to drill into mistakes, Correct to revisit what worked, or Skipped to clean up gaps.",
    },
    {
      id: "review-card",
      target: '[data-tour="review-card"]',
      title: "Per-question breakdown",
      body: "Your pick, the correct answer, the explanation — all inline. The colored stripe on the left tells you status at a glance.",
    },
    {
      id: "review-ai",
      target: '[data-tour="review-ai"]',
      title: "Deeper AI explanation",
      body: "Not satisfied with the stock explanation? Tap this and the AI writes a fresh walkthrough, common pitfalls, and a follow-up practice plan.",
    },
  ],

  progress: [
    {
      id: "progress-kpis",
      target: '[data-tour="progress-kpis"]',
      title: "The big numbers",
      body: "Your running accuracy, average pace, and attempts. Quick pulse check.",
      route: "/dashboard/progress",
    },
    {
      id: "progress-ai",
      target: '[data-tour="progress-ai"]',
      title: "AI trend analysis",
      body: "Not a single session — this is the multi-week view. It explains WHY your trend lines look the way they do.",
      route: "/dashboard/progress",
    },
    {
      id: "progress-mastery",
      target: '[data-tour="progress-mastery"]',
      title: "Topic mastery",
      body: "Every topic you've touched, ranked by accuracy. The red ones are where your next session should go.",
      route: "/dashboard/progress",
    },
  ],

  profile: [
    {
      id: "profile-proctor-prefs",
      target: '[data-tour="profile-proctor-prefs"]',
      title: "Proctoring preferences",
      body: "Toggle webcam monitoring, choose sensitivity, and set what we watch for (phones, multi-person, gaze).",
      route: "/dashboard/profile",
    },
    {
      id: "profile-reports",
      target: '[data-tour="profile-reports"]',
      title: "Your proctoring reports",
      body: "Every proctored session saves a PDF here with the incidents and snapshots. Stored locally on this device only.",
      route: "/dashboard/profile",
    },
    {
      id: "profile-replay",
      target: '[data-tour="profile-replay"]',
      title: "Replay any tour",
      body: "Lost? Every tour in the app can be restarted from here, any time.",
      route: "/dashboard/profile",
    },
  ],
};

// Filter the tour catalogue at module load. In dev we keep every step so we
// can validate copy as features land; in prod we drop steps and entire tours
// whose targets are hidden behind the coming-soon gate, so the spotlight
// never lands on an invisible element.
const GATED = isProductionGated();

export const TOURS: Record<TourId, TourStep[]> = GATED
  ? (Object.fromEntries(
      (Object.entries(RAW_TOURS) as [TourId, TourStep[]][]).map(([id, steps]) => {
        if (RAW_TOUR_META[id].mvpGated) return [id, []];
        return [id, steps.filter((s) => !s.mvpGated)];
      }),
    ) as Record<TourId, TourStep[]>)
  : RAW_TOURS;

export const TOUR_META: Record<TourId, TourMeta> = RAW_TOUR_META;

/** True when the tour has at least one playable step in the current build. */
export function isTourAvailable(id: TourId): boolean {
  return TOURS[id].length > 0;
}
