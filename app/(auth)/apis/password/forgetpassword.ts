import { adminAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { ForgotPasswordData } from "../../forgot-password/page";

/**
 * forget password
 * @param params forget password
 * @returns Promise with the API response
 */



const forgetPassword = async (payload: ForgotPasswordData) => {
    console.log(payload);
    
  const response = await adminAxios.post('/api/v1/prep-master/password-reset/request', payload);
  return response?.data;
}

export const useForgetPassword = () => {
  return useMutation({
    mutationFn: forgetPassword
  });
}

