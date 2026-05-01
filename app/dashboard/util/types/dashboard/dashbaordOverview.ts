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
  daily_tip: string | null;
  recent_sessions: Recentsessions;
  active_sessions: Recentsessions;
  recommended_exams?: Recommendedexams;
  subscription: Subscription;
  user_exams: Userexam[];
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

interface Subscription {
  is_subscribed: boolean;
  free_question_limit: number;
  active_subscription: null;
}

interface Subject {
  id: number;
  reference: string;
  name: string;
  difficulty_level:"easy"|"medium"|"hard"
  total_topics: number;
  total_questions: number;
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


export interface Userexam {
  config_id: number;
  exam_date: string | null;
  target_score: string | null;
  daily_study_hours: number | null;
  current_level: string | null;
  send_progress_report?: boolean | null;
  exam: UserExamExam;
}

/** Exam shape nested under each user_exams[].exam — distinct from the
 *  recent_sessions[].exam_type shape, which still includes description/is_premium. */
export interface UserExamExam {
  id: number;
  reference: string;
  name: string;
  country: string | null;
  difficulty_level: string;
  total_questions: number;
  total_topics: number;
  last_score: number | null;
  active_session_id: number | null;
  subjects: Subject[];
}

/** Legacy shape used elsewhere (e.g. recent_sessions[].exam_type). */
export interface Examtype {
  id: number;
  reference: string;
  name: string;
  description: string;
  is_premium: boolean;
  difficulty_level: string;
  total_questions: number;
  total_topics: number;
  previous_score_percentage: number | null;
  active_session_id: number | null;
  subjects: Subject[];
}




