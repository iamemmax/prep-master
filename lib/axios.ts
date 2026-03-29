import Axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const ADMIN_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

// ─── Instances ────────────────────────────────────────────────────────────────
export const adminAxios = Axios.create({
  baseURL: ADMIN_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const tokenlessAxios = Axios.create({
  baseURL: ADMIN_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ─── Global logout handler ────────────────────────────────────────────────────
let globalLogoutHandler: (() => void) | null = null;

export const setAdminGlobalLogoutHandler = (handler: () => void) => {
  globalLogoutHandler = handler;
};

function forceLogout() {
  if (globalLogoutHandler) {
    globalLogoutHandler();
    return;
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    delete adminAxios.defaults.headers.common.Authorization;
    window.location.replace("/");
  }
}

// ─── Token helpers ────────────────────────────────────────────────────────────
function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

function saveAccessToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("access_token", token);
  adminAxios.defaults.headers.common.Authorization = `Bearer ${token}`;
}

// ─── Refresh logic (queue-based to avoid multiple simultaneous refreshes) ─────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
  failedQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token");

  const { data } = await tokenlessAxios.post("/api/v1/auth/token/refresh/", {
    refresh,
  });

  const newAccess: string = data?.access ?? data?.data?.access;
  if (!newAccess) throw new Error("Refresh response missing access token");

  saveAccessToken(newAccess);
  return newAccess;
}

// ─── Response interceptor ─────────────────────────────────────────────────────
adminAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isTokenError =
      error.response?.status === 401 ||
      error.response?.data?.code === "token_not_valid" ||
      error.response?.data?.detail?.includes("token not valid") ||
      error.response?.data?.messages?.some(
        (msg: { message: string }) => msg.message === "Token is expired"
      );

    // Only attempt refresh once per request
    if (isTokenError && !originalRequest._retry) {
      if (isRefreshing) {
        // Another refresh is in flight — queue this request and wait
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(adminAxios(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return adminAxios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        forceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Non-token errors
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      error.message = "Request timeout. Please check your internet connection.";
    } else if (error.code === "ERR_NETWORK" || !error.response) {
      error.message = "Network error. Please check your internet connection.";
    }

    return Promise.reject(error);
  }
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const setAxiosDefaultToken = (
  token: string,
  axiosInstance: AxiosInstance
) => {
  axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const deleteAxiosDefaultToken = () => {
  delete adminAxios.defaults.headers.common.Authorization;
};