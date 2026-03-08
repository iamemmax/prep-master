"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/authentication";

interface UseSessionExpirationProps {
  expirationTime?: number; // Time in milliseconds
}

export function useSessionExpiration({ expirationTime = 30 * 60 * 1000 }: UseSessionExpirationProps = {}) {
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const { authState } = useAuth();
  
  const resetSession = useCallback(() => {
    setIsSessionExpired(false);
  }, []);

  useEffect(() => {
    if (!authState.isAuthenticated) return;
    
    let inactivityTimer: NodeJS.Timeout;
    
    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      
      inactivityTimer = setTimeout(() => {
        setIsSessionExpired(true);
      }, expirationTime);
    };
    
    // Set up event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Reset the timer when the user is active
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });
    
    // Initialize the timer
    resetTimer();
    
    // Clean up
    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [authState.isAuthenticated, expirationTime]);
  
  return { isSessionExpired, resetSession };
}