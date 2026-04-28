// import { adminAxios } from "@/app/lib/axios";
import { adminAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

/**
 * reset password
 * @param params set new  password
 * @returns Promise with the API response
 */

interface prop{
    new_password:string
    token:string
}


const setNewPassword = async (payload: prop) => {

    
  const response = await adminAxios.post('/api/v1/prep-master/password-reset/confirm/', payload);
  return response?.data;
}

export const useSetNewPassword = () => {
  return useMutation({
    mutationFn: setNewPassword
  });
}

