import Axios from "axios";
import type { AxiosInstance } from "axios";

const API_BASE_URL = process.env
  .NEXT_PUBLIC_LIFE_SAVINGS_API_BASE_URL as string;

// Global logout handler - will be set by auth context
let globalLogoutHandler: (() => void) | null = null;

export const setGlobalLogoutHandler = (handler: () => void) => {
  globalLogoutHandler = handler;
};

export const assesmentAxios = Axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add response interceptor for token expiration
assesmentAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.code === 'token_not_valid' || 
        error.response?.data?.detail?.includes('token not valid') ||
        error.response?.data?.messages?.some((msg: any) => msg.message === 'Token is expired')) {
      // Use global logout handler if available, otherwise fallback to manual cleanup
      if (globalLogoutHandler) {
        globalLogoutHandler();
      } else if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        delete assesmentAxios.defaults.headers.common.Authorization;
        window.location.replace('/');
      }
    }
    return Promise.reject(error);
  }
);


export const tokenlessAxios = Axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const setAxiosDefaultToken = (
  token: string,
  axiosInstance: AxiosInstance
) => {
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  
  }
};

export const deleteAxiosDefaultToken = () => {
  delete assesmentAxios.defaults.headers.common.Authorization;
};
