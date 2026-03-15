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


// interface RootObject {
//   status: string;
//   data: Data;
//   message: string;
// }

// interface Data {
//   user: User;
//   profile: Profile;
//   access_token: string;
//   refresh_token: string;
// }

// interface Profile {
//   country: string;
// }

// interface User {
//   id: number;
//   email: string;
//   user_type: string;
// }
const completeOnboarding = async (payload: prop) => {
  const response = await tokenlessAxios.post('/api/v1/prep-master/onboarding/complete/', payload);
  return response?.data;
}

export const useCompleteOnboarding = () => {
  return useMutation({
    mutationFn: completeOnboarding
  });
}

