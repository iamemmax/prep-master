import { SessionFormData } from "@/app/dashboard/components/practices/StartSessionModal";
import { adminAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { startPracticeType } from "../../types/pratcie/StartPracticeTypes";

export type StartPracticePayload = SessionFormData & {
  use_ai_questions?: boolean;
  subject_name?: string;
};

const startPracticeExam = async (data: StartPracticePayload) => {
  const response = await adminAxios.post(`/api/v1/prepmaster/student/practice/start/`, data);
  return response.data as startPracticeType;
}


export const useStartPracticeExam = () => {
    return useMutation({
        mutationFn: startPracticeExam,

      })
}
