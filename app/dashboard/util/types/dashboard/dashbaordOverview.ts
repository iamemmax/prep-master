export interface dashbaordOverviewTypes {
  status: string;
  data: Data;
  message: string;
}

// interface Data {
//   overview: dashboardOverviewData;
//   daily_tip: null;
//   recent_sessions: Recentsession[];
//   recommended_exams: Recommendedexam[];
// }

// interface Recommendedexam {
//   id: number;
//   reference: string;
//   name: string;
//   description: string;
//   is_premium: boolean;
//   total_questions: number;
//   subjects: Subjectsselected[];
// }

// interface Recentsession {
//   id: number;
//   reference: string;
//   is_active: boolean;
//   created_at: string;
//   updated_at: string;
//   subjects_selected: Subjectsselected[];
//   topics_selected: Subjectsselected[];
//   difficulty_level: string;
//   number_of_questions: number;
//   session_mode: string;
//   time_limit_minutes: number;
//   show_explanation_after_answer: boolean;
//   start_time: string;
//   end_time: string;
//   score: number;
//   status: string;
//   user: number;
//   exam_type: number;
// }

// interface Subjectsselected {
//   id: number;
//   reference: string;
//   name: string;
// }

// export interface dashboardOverviewData {
//   average_score: number;
//   questions_answered: number;
//   total_attempts: number;
//   day_streak: number;
//   days_remaining: null;
//   overall_readiness: number;
//   target_score: null;
// }






interface Data {
  overview: dashboardOverviewData;
  daily_tip: null;
  recent_sessions: Recentsessions;
  active_sessions: Recentsessions;
  recommended_exams: Recommendedexams;
}

interface Recommendedexams {
  count: number;
  next: string;
  previous: null;
  data: Datum[];
}

interface Datum {
  id: number;
  reference: string;
  name: string;
  description: string;
  is_premium: boolean;
  difficulty_level: string;
  total_questions: number;
  total_topics: number;
  previous_score_percentage: null;
  active_session_id: null;
  subjects: Subject[];
}

interface Subject {
  id: number;
  reference: string;
  name: string;
}

interface Recentsessions {
  count: number;
  next: null;
  previous: null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
}

export interface dashboardOverviewData {
  average_score: number;
  questions_answered: number;
  total_attempts: number;
  day_streak: number;
  days_remaining: number;
  overall_readiness: number;
  target_score: string;
}