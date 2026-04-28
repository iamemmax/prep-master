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
  topic: Subject;
  text: string;
  options: Option[] | Record<string, string>;
  explanation?: string;
  difficulty_level: string;
}

export interface PracticeResponse {
  id?: number;
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
  reference: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subjects_selected: string[];
  topics_selected: string[];
  difficulty_level: string;
  number_of_questions: number;
  session_mode: string;
  time_limit_minutes: number;
  show_explanation_after_answer: boolean;
  start_time: string;
  end_time: null;
  score: null;
  status: string;
  user: number;
  exam_type: number | string;
}




