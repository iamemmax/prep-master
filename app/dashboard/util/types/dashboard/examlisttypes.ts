export interface examsListTypes {
  status: string;
  data: Datum[];
  message: string;
}

interface Datum {
  id: number;
  reference: string;
  name: string;
  description: string;
  subjects: Subject[];
}

interface Subject {
  id: number;
  reference: string;
  name: string;
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
  available_difficulties: string[];
  previous_score_percentage: number;
  subjects: avaiSubject[];
}

interface avaiSubject {
  id: number;
  reference: string;
  name: string;
}