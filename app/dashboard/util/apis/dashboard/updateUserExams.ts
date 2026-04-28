import { adminAxios } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERYKEY } from "@/key/queryKey";

export interface UserExamConfigPayload {
  country: string;
  exam_type_id: number;
  exam_date: string | null;
  target_score: string | null;
  daily_study_hours: number | null;
  current_level: string | null;
  send_progress_report: boolean;
}

const updateUserExams = async (payload: UserExamConfigPayload[]) => {
  const response = await adminAxios.post(
    `/api/v1/prepmaster/student/exam-config/`,
    payload
  );
  return response?.data;
};

export const useUpdateUserExams = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateUserExams,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERYKEY.PRACTICE_EXAM_CONFIG] });
      qc.invalidateQueries({ queryKey: QUERYKEY.DASHBOARD_OVERVIEW });
      qc.invalidateQueries({ queryKey: QUERYKEY.USER_DETAIL });
    },
  });
};
