import { tokenlessAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

/**
 * signup new user
 * @param params verify user
 * @returns Promise with the API response
 */


export interface CompleteOnboardingPayload {
  email: string;
  country: string | null;
  exam_type: number | null;
  exam_date: string | null;
  target_score: string | null;
  daily_study_hours: number | null;
  current_level: string | null;
  send_progress_report: boolean | null;
}


const completeOnboarding = async (payload: CompleteOnboardingPayload) => {
  const response = await tokenlessAxios.post('/api/v1/prep-master/onboarding/complete/', payload);
  return response?.data;
}

export const useCompleteOnboarding = () => {
  return useMutation({
    mutationFn: completeOnboarding
  });
}

