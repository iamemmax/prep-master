import { tokenlessAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

/**
 * signup new user
 * @param params verify user
 * @returns Promise with the API response
 */


interface prop {
  email: string;
  country: string;
  preparing_for_exam: string;
  other_exam: string;
  exam_date: string;
  target_score: string;
  daily_study_hours: number;
  current_level: string;
  send_progress_report: boolean;
}

const completeOnboarding = async (payload: prop) => {
  const response = await tokenlessAxios.post('/api/v1/prep-master/onboarding/complete/', payload);
  return response?.data;
}

export const useCompleteOnboarding = () => {
  return useMutation({
    mutationFn: completeOnboarding
  });
}

