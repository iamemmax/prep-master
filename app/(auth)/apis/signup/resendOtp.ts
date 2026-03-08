import { tokenlessAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

/**
 * resend otp
 * @param params resend otp
 * @returns Promise with the API response
 */



const resendOtp = async (email:string) => {
  const response = await tokenlessAxios.post('/api/v1/prep-master/onboarding/resend-otp', {email});
  return response?.data;
}

export const useResendOtp = () => {
  return useMutation({
    mutationFn: resendOtp
  });
}

