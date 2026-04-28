export interface examsListTypes {
  status: string;
  data: availableData[];
  message: string;
  next: string | null;
  previous: string | null;
  count: number;
}



export interface availableExamDetails {
  status: string;
  data: availableData;
  message: string;
}


export interface availableData {
  id: number;
  reference: string;
  name: string;
  description: string;
  is_premium: boolean;
  total_questions: number;
  total_topics: number;
  subject_count: number;
  available_difficulties: string[];
  previous_score_percentage: number;
  active_session_id: null | number;
  subjects: avaiSubject[];
}

interface avaiSubject {
  id: number;
  reference: string;
  name: string;
  description: string;
  difficulty_level: string;
  is_premium: boolean;
  subject_count: number;
}





