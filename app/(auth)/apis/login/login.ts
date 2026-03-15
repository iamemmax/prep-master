import { useAuth } from "@/context/authentication";
import { tokenStorage } from "@/utils/auth";
import { useMutation } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { getAuthenticatedUser } from "../signup/user/getAuthenticatedUser";
import { adminAxios, setAxiosDefaultToken, tokenlessAxios } from "@/lib/axios";
import { LoginData } from "../../signin/page";




interface TokenResponse {
  status: string;
  data: Data;
  message: string;
}

interface Data {
  refresh: string;
  access: string;
}
const login = (loginDto: LoginData): Promise<AxiosResponse<TokenResponse>> =>
  tokenlessAxios.post("/api/v1/auth/login/", loginDto, {
    headers: {
      Authorization: undefined
    }
  });

export const useLogin = () => {
  const { authDispatch } = useAuth();

  return useMutation({
    mutationKey: ["login"],
    mutationFn: login,
    onSuccess: async (response) => {
      const { data } = response;
      
      // Get the access token from the nested data object
      const token = data?.data?.access;
      
      
      if (!token) {
        console.error("No token received in login response");
        return;
      }
      
      // Store the token
      tokenStorage.setToken(token);     
         // Set the token for future requests
          setAxiosDefaultToken(token, adminAxios);
          // Fetch user data after successful login
            const user = await getAuthenticatedUser();
                  if (authDispatch) {
                    // Update auth state with user data
                    authDispatch({ type: "LOGIN", payload: user?.data });
                    authDispatch({ type: "STOP_LOADING" });
                  }
                  console.log(user);
      
        
    },
    onError: (error) => {
      console.error("Login error:", error);
      if (authDispatch) {
        authDispatch({ type: "STOP_LOADING" });
      }
    }
  });
};