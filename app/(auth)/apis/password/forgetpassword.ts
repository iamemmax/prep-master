import { adminAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { ForgotPasswordData } from "../../forgot-password/page";

/**
 * forget password
 * @param params forget password
 * @returns Promise with the API response
 */


interface successMsg {
  status: string;
  data: Data;
  message: string;
}

interface Data {
  message: string;
  email: string;
}

const forgetPassword = async (payload: ForgotPasswordData) => {
    console.log(payload);
    
  const response = await adminAxios.post('/api/v1/prep-master/password-reset/', payload);
  return response?.data as successMsg;
}

export const useForgetPassword = () => {
  return useMutation({
    mutationFn: forgetPassword
  });
}

