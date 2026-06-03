import { SessionFormData } from "@/app/dashboard/components/practices/StartSessionModal";
import { adminAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { startPracticeType } from "../../types/pratcie/StartPracticeTypes";

// `topics_selected` becomes optional here because the backend rejects an
// empty array and interprets a missing field as "all topics". Same goes for
// `subjects_selected` for consistency. Callers strip these out when empty.
export type StartPracticePayload = Omit<SessionFormData, "topics_selected" | "subjects_selected"> & {
  use_ai_questions?: boolean;
  subject_name?: string;
  subjects_selected?: number[];
  topics_selected?: number[];
};

const startPracticeExam = async (data: StartPracticePayload) => {
  // Defensive: strip empty arrays the backend treats as invalid.
  const body: Record<string, unknown> = { ...data };
  if (Array.isArray(body.topics_selected) && body.topics_selected.length === 0) {
    delete body.topics_selected;
  }
  if (Array.isArray(body.subjects_selected) && body.subjects_selected.length === 0) {
    delete body.subjects_selected;
  }
  const response = await adminAxios.post(`/api/v1/prepmaster/student/practice/start/`, body);
  return response.data as startPracticeType;
}


export const useStartPracticeExam = () => {
    return useMutation({
        mutationFn: startPracticeExam,

      })
}
