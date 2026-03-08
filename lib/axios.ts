// import { assesmentAxios } from "@/utils/axios";
import Axios from "axios";
import type { AxiosInstance } from "axios";

const ADMIN_API_BASE_URL = process.env
  .NEXT_PUBLIC_API_BASE_URL as string;

// Global logout handler - will be set by auth context
let globalLogoutHandler: (() => void) | null = null;

export const setAdminGlobalLogoutHandler = (handler: () => void) => {
  globalLogoutHandler = handler;
};

export const adminAxios = Axios.create({
  baseURL: ADMIN_API_BASE_URL,
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});
export const tokenlessAxios = Axios.create({
  baseURL: ADMIN_API_BASE_URL,
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error handling
adminAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response?.data?.code === 'token_not_valid' || 
        error.response?.data?.detail?.includes('token not valid') ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error.response?.data?.messages?.some((msg: any) => msg.message === 'Token is expired')) {
      // Use global logout handler if available, otherwise fallback to manual cleanup
      if (globalLogoutHandler) {
        globalLogoutHandler();
      } else if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        delete adminAxios.defaults.headers.common.Authorization;
        window.location.replace('/');
      }
      return Promise.reject(error);
    }
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      error.message = 'Request timeout. Please check your internet connection.';
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      error.message = 'Network Error. Please check your internet connection.';
    }
    return Promise.reject(error);
  }
);

export const setAxiosDefaultToken = (
  token: string,
  axiosInstance: AxiosInstance
  // axios_Instance: AxiosInstance,
) => {
  axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  // axios_Instance.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const deleteAxiosDefaultToken = () => {  
  delete adminAxios.defaults.headers.common.Authorization;
  // delete assesmentAxios.defaults.headers.common.Authorization;
  
  // console.log("deleteAxiosDefaultToken: After deletion", adminAxios.defaults.headers.common.Authorization ? "Authorization header still exists" : "Authorization header removed");
};
