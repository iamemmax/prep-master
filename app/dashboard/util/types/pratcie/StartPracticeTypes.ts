export interface startPracticeType {
  status: string;
  data: SessionWithQuestions;
  message: string;
}

export interface SessionWithQuestions extends Session {
  questions: Question[];
}

export interface Question {
  id: number;
  subject: Subject;
  topic: Subject;
  reference: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  text: string;
  difficulty_level: string;
  options: Option[] | Record<string, string>;
  exam_type: number;
  explanation?: string;
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