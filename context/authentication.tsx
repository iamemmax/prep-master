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





export interface User {
  email: string;
  username: string;
  full_name: string;
  id: number;
  role: string;
  user_type: "EXAMINER" | "EXAMINEE",
  status: string;
  is_active: boolean;
  created_at: string;
  profile: Profile;
}

interface Profile {
  id: number;
  user_id: number;
  organization_name: string;
  type_of_professional_body: string;
  country: string;
  organization_size: string;
  phone_number: string;
  agree_to_terms_and_conditions: boolean;
  is_verified: boolean;
  verification_date: null;
  created_at: string;
}
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

type AuthAction =
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "STOP_LOADING" }
  | { type: "UPDATE_USER"; payload: Partial<User> };

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
            authDispatch({ type: "LOGIN", payload: user });
            tokenStorage.setUser(user);
            console.log("🔁 User refreshed from API");
          } catch (err) {
            console.error("❌ Failed to refresh user:", err);
            tokenStorage.clearToken();
            deleteAxiosDefaultToken();
            authDispatch({ type: "LOGOUT" });
          }
        } else {
          console.log("⚠️ No token found, skipping user refresh");
          tokenStorage.clearToken();
          deleteAxiosDefaultToken();
          authDispatch({ type: "LOGOUT" });
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
