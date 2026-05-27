// export interface practiceHistoryTypes {
//   status: string;
//   data: practiceHistoryData[];
//   message: string;
// }

// export interface practiceHistoryData {
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
//   end_time: null | string;
//   score: null | number;
//   status: string;
//   user: number;
//   exam_type: number;
// }

interface Subjectsselected {
  id: number;
  reference: string;
  name: string;
}

export interface practiceHistoryTypes {

  status: string;
  data: practiceHistoryData[];
  count: number;
  next: string;
  previous: null;
  message: string;
}

export interface practiceHistoryData {
  id: number;
  reference: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // The backend has been returning `null` for these on some sessions (e.g.
  // older records where no subjects/topics were captured). Type them as
  // nullable so consumers are forced to guard before calling .map/.length.
  subjects_selected: Subjectsselected[] | null;
  topics_selected: Subjectsselected[] | null;
  difficulty_level: string;
  number_of_questions: number;
  session_mode: string;
  time_limit_minutes: number;
  show_explanation_after_answer: boolean;
  question_ids: number[];
  start_time: string;
  end_time: null | string;
  score: null | number;
  status: string;
  user: number;
  exam_type: number;
}