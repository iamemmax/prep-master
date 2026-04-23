// Shape of every JSON response the AI coach returns. The backend endpoint
// should validate the model output against these before sending to the client.

// ─── Overall session feedback ────────────────────────────────────────────────
export interface AIFeedback {
  summary: string;
  insights: string[];
  actions: string[];
  motivation: string;
}
export interface AIFeedbackRequest {
  session_id: string | number;
  score: number;
  accuracy: number;
  avgTime: number;
  totalQuestions: number;
  weakTopics: string[];
  strongTopics: string[];
}

// ─── Mistake analysis ────────────────────────────────────────────────────────
export interface MistakeQuestion {
  text: string;
  selected_answer?: string;
  correct_answer?: string;
  topic?: string;
  explanation?: string;
}
export interface MistakeAnalysis {
  patterns: string[];
  root_causes: string[];
  avoid_next_time: string[];
  summary: string;
}
export interface MistakeAnalysisRequest {
  session_id: string | number;
  questions: MistakeQuestion[];
}

// ─── Dashboard glance insight ────────────────────────────────────────────────
export interface DashboardInsight {
  feedback: string;
  nextAction: string;
  focusArea: string;
  motivation: string;
}
export interface DashboardInsightRequest {
  accuracy: number;
  avgTime: number;
  weakTopics: string[];
  recentMistakes: number;
  improvement: number;
}

// ─── Long-term progress insight ──────────────────────────────────────────────
export type Trend = "increasing" | "dropping" | "flat";
export type Consistency = "high" | "medium" | "low";
export interface ProgressInsight {
  summary: string;
  insights: string[];
  recommendations: string[];
}
export interface ProgressInsightRequest {
  accuracyTrend: Trend;
  avgTimeTrend: Trend;
  strongTopics: string[];
  weakTopics: string[];
  consistency: Consistency;
}

// ─── Per-question deep analysis ──────────────────────────────────────────────
export interface QuestionAnalysis {
  why_correct: string;
  why_wrong: string | null;
  common_pitfalls: string[];
  alt_explanation: string;
  related_practice: string;
}
export interface QuestionAnalysisRequest {
  question_id: number;
  question_text: string;
  options: { label: string; text: string }[];
  correct_answer: string;
  selected_answer?: string;
  topic?: string;
  base_explanation?: string;
}

// ─── Session review (post-submission answer key) ─────────────────────────────
export interface ReviewOption {
  label: string;  // "A", "B", "C", "D"
  text: string;
}
export interface ReviewQuestion {
  id: number;
  text: string;
  options: ReviewOption[];
  correct_answer: string;       // option label
  selected_answer: string | null;
  is_correct: boolean;
  explanation: string;
  topic: string;
  difficulty: string;
  time_spent_sec?: number;
}
export interface SessionReview {
  session_id: string | number;
  exam_type: string;
  difficulty: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  submitted_at: string;
  questions: ReviewQuestion[];
}

// ─── Weakness study plan ─────────────────────────────────────────────────────
export interface WeaknessPlanItem {
  topic: string;
  question_count: number;
  focus: string;
  common_mistakes: string[];
}
export interface WeaknessPlan {
  start_with: string;
  practice_plan: WeaknessPlanItem[];
  strategy: string;
}
export interface WeaknessPlanRequest {
  session_id: string | number;
  topics: string[];
}
