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
    headers: { Authorization: undefined },
  });

export const useLogin = () => {
  const { authDispatch } = useAuth();

  return useMutation({
    mutationKey: ["login"],
    mutationFn: login,
    onSuccess: async (response) => {
      const { data } = response;

      const accessToken  = data?.data?.access;
      const refreshToken = data?.data?.refresh;

      if (!accessToken) {
        console.error("No access token received in login response");
        return;
      }

      // ── Persist both tokens ──────────────────────────────────────────────
      // access token — used by tokenStorage / existing helpers
      tokenStorage.setToken(accessToken);

      // refresh token — required by the axios interceptor for silent renewal
      if (refreshToken && typeof window !== "undefined") {
        localStorage.setItem("refresh_token", refreshToken);
      }

      // ── Attach access token to all future requests ────────────────────────
      setAxiosDefaultToken(accessToken, adminAxios);

      // ── Fetch the authenticated user profile ──────────────────────────────
      try {
        const user = await getAuthenticatedUser();
        if (authDispatch) {
          authDispatch({ type: "LOGIN",        payload: user?.data });
          authDispatch({ type: "STOP_LOADING"                      });
        }
      } catch (err) {
        console.error("Failed to fetch authenticated user:", err);
        if (authDispatch) {
          authDispatch({ type: "STOP_LOADING" });
        }
      }
    },

    onError: (error) => {
      console.error("Login error:", error);
      if (authDispatch) {
        authDispatch({ type: "STOP_LOADING" });
      }
    },
  });
};