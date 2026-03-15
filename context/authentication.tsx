/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useEffect, useReducer } from "react";
import {
  adminAxios,
  deleteAxiosDefaultToken,
  setAxiosDefaultToken,
  setAdminGlobalLogoutHandler,
} from "../lib/axios";
import { tokenStorage } from "@/lib/auth";
import { getAuthenticatedUser } from "@/app/(auth)/apis/signup/user/getAuthenticatedUser";
// import { assesmentAxios, setGlobalLogoutHandler } from "@/utils/axios";


export interface userDetailsTypes {
  status: string;
  data: UserProfile;
  message: string;
}

export interface UserProfile {
  user: User;
  profile: Profile;
  exam_config: Examconfig;
}

interface Examconfig {
  preparing_for_exam: string;
  other_exam: null;
  exam_date: null;
  target_score: null;
  daily_study_hours: null;
  current_level: null;
  send_progress_report: boolean;
}

interface Profile {
  country: string;
}

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
}
export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;  // ← was User | null
  isLoading: boolean;
}

type AuthAction =
  | { type: "LOGIN"; payload: UserProfile }
  | { type: "LOGOUT" }
  | { type: "STOP_LOADING" }
  | { type: "UPDATE_USER"; payload: Partial<UserProfile> };

interface AuthContextType {
  authState: AuthState;
  authDispatch: React.Dispatch<AuthAction>;
  ensureToken: () => string | null;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  try {
    switch (action.type) {
      case "LOGIN":
        console.log('🔐 AUTH CONTEXT: User logged in, current path:', window.location.pathname);
        tokenStorage.setUser(action.payload); // persist user
        return {
          ...state,
          isAuthenticated: true,
          user: action.payload,
          isLoading: false,
        };

     case "UPDATE_USER":
  const updatedUser = state.user
    ? { ...state.user, ...action.payload }
    : null;
  if (updatedUser) tokenStorage.setUser(updatedUser);
  return { ...state, user: updatedUser };

      case "LOGOUT":
        try {
          tokenStorage.clearToken();
          deleteAxiosDefaultToken();
          console.log("✅ Logout successful - All tokens cleared");
        } catch (error) {
          console.error("❌ Error during logout:", error);
        }
        return {
          ...state,
          isAuthenticated: false,
          user: null,
          isLoading: false,
        };

      case "STOP_LOADING":
        return { ...state, isLoading: false };

      default:
        return state;
    }
  } catch (error) {
    console.error("❌ Auth reducer error:", error);
    return { ...state, isLoading: false };
  }
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, authDispatch] = useReducer(authReducer, initialState);

  // Logout function to be used by axios interceptors
  const handleLogout = () => {
    authDispatch({ type: "LOGOUT" });
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    }
  };

  // Register logout handler with axios
  React.useEffect(() => {
    setAdminGlobalLogoutHandler(handleLogout);
    setAdminGlobalLogoutHandler(handleLogout);
  }, []);

  // Function to ensure token is always set in axios
  const ensureToken = (): string | null => {
    const token = tokenStorage.getToken();

    if (token) {
      setAxiosDefaultToken(token, adminAxios);
      return token;
    }

    console.warn("⚠️ No token found in localStorage");
    deleteAxiosDefaultToken();
    deleteAxiosDefaultToken();
    return null;
  };

  // Initialize auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = tokenStorage.getToken();
        const storedUser = tokenStorage.getUser();
      

        if (token) {
          setAxiosDefaultToken(token, adminAxios);
          console.log("🔑 Token restored from localStorage");
        }

        if (storedUser) {
          authDispatch({ type: "LOGIN", payload: storedUser });
          console.log("✅ User restored from localStorage");
        }

        // Refresh user from API only if token exists
       if (token) {
  try {
    const user = await getAuthenticatedUser();
    authDispatch({ type: "LOGIN", payload: user?.data });
    tokenStorage.setUser(user?.data); // ← store user.data not the full response
  } catch (err: any) {
    console.error("❌ Failed to refresh user:", err);
    // only clear token on 401, not on network errors
    if (err?.response?.status === 401) {
      tokenStorage.clearToken();
      deleteAxiosDefaultToken();
      authDispatch({ type: "LOGOUT" });
    } else {
      // network error — keep existing token and stored user
      console.warn("⚠️ Network error during refresh, keeping existing session");
      authDispatch({ type: "STOP_LOADING" });
    }
  }
} else {
  // no token — just stop loading, don't clear anything
  authDispatch({ type: "STOP_LOADING" });
}
      } finally {
        // ✅ Always stop loading, even if something fails
        authDispatch({ type: "STOP_LOADING" });
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ authState, authDispatch, ensureToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
