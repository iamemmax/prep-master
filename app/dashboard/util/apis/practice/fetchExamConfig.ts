import { adminAxios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { QUERYKEY } from "@/key/queryKey";




interface success {
  status: string;
  data: ExamConfigEntry[];
  message: string;
}

export interface ExamConfigEntry {
  id: number;
  reference: string;
  exam_type: Examtype;
  exam_date: string | null;
  target_score: string | null;
  daily_study_hours: number | null;
  current_level: string | null;
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

interface Subject {
  id: number;
  reference: string;
  name: string;
}
export const getPracticeExamConfig = async () => {
  const response = await adminAxios.get(
    `/api/v1/prepmaster/student/exam-config/`
  );
  return response?.data as success;
};

export const useGetPracticeExamConfig = () => {
  return useQuery({
    // Explicit string key + page number — no spread, no staleTime
    queryKey: [QUERYKEY.PRACTICE_EXAM_CONFIG],
    queryFn:  getPracticeExamConfig,
    retry: 2,
   
  });
};