"use client"
import { useState, useEffect } from "react";

export default function useIsMobile() {
  // Initialize with null to indicate "not determined yet"
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    // Set initial value immediately on mount
    setIsMobile(window.innerWidth < 768);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Return false during SSR, then the actual value once determined
  return isMobile === null ? false : isMobile;
}
