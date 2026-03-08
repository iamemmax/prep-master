import { tokenlessAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

/**
 * signup new user
 * @param params verify user
 * @returns Promise with the API response
 */
interface prop{
  email:string;
  otp_code:string
}


const verifyUser = async (payload: prop) => {
    
  const response = await tokenlessAxios.post('/api/v1/prep-master/onboarding/verify-otp/', payload);
  return response?.data;
}

export const useVerifyUser = () => {
  return useMutation({
    mutationFn: verifyUser
  });
}

