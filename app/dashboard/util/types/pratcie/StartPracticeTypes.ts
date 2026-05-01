export interface startPracticeType {
  status: string;
  data: SessionWithQuestions;
  message: string;
}

export interface SessionWithQuestions extends Session {
  /** Optional nested session object — kept for back-compat with older payloads. */
  session?: Session;
  questions: Question[];
  /** Previously-submitted answers for this session (resume support). */
  responses: PracticeResponse[];
  /** Question id of the most recent submission, used to resume at the next question. */
  last_answered_question_id: number | null;
  /** Server-side count of how many questions already have a submitted response. */
  answered_count: number;
  enable_proctoring: boolean;
  question_ids: number[];
}

export interface Question {
  id: number;
  reference: string;
  subject: Subject;
  topic: Subject | null;
  text: string;
  options: Option[] | Record<string, string>;
  explanation?: string;
  difficulty_level: string;
}

export interface PracticeResponse {
  id?: number;
  /** ID of the question this response belongs to. Matches the `question_id`
   *  field used by the submit endpoint and the review endpoint. */
  question_id: number;
  /** Option reference (matches the `selected_answer` we POST when submitting). */
  selected_answer: string;
  is_correct?: boolean;
}



export interface Option {
  id: number;
  reference: string;
  option_text: string;
  is_correct?: boolean;
}

export interface Subject {
  id: number;
  reference: string;
  name: string;
}

export interface Session {
   id: number;
  questions: Question[];
  // The DOM `Response` type was being picked up here by mistake — typing as
  // PracticeResponse[] aligns with what the API actually returns and lets
  // SessionWithQuestions extend without an "incorrectly extends" error.
  responses: PracticeResponse[];
  last_answered_question_id: number | null;
  answered_count: number;
  exam_config: Examconfig;
  reference: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subjects_selected: Subject[];
  topics_selected: string[];
  difficulty_level: string;
  number_of_questions: number;
  session_mode: string;
  time_limit_minutes: number;
  show_explanation_after_answer: boolean;
  enable_proctoring: boolean;
  question_ids: number[];
  start_time: string;
  end_time: null;
  score: null;
  status: string;
  user: number;
  exam_type: number;
}







interface Examconfig {
  id: number;
  reference: string;
  exam_type: Examtype;
  exam_date: string | null;
  target_score: string;
  daily_study_hours: number;
  current_level: string;
  send_progress_report: boolean;
}

interface Examtype {
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





 
