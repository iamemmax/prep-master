import { tokenlessAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { userOnboardingInfoTypes } from "../../signup/page";

/**
 * signup new user
 * @param params sign up user
 * @returns Promise with the API response
 */








const onboardUser = async (payload: userOnboardingInfoTypes) => {
    
  const response = await tokenlessAxios.post('/api/v1/prep-master/onboarding/start/', payload);
  return response?.data;
}

export const useOnboardUser = () => {
  return useMutation({
    mutationFn: onboardUser
  });
}

