"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { deleteAxiosDefaultToken } from "./axios";
import PageLoader from "./PageLoader";
import { tokenStorage } from "./auth";
import { useAuth } from "@/context/authentication";



export default function ProtectedRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authState, authDispatch } = useAuth();
  const { isAuthenticated, isLoading } = authState;
  const pathname = usePathname();
  const router = useRouter();

  // Define protected routes
  const protectedRoutes = [
   "/"
    
  ];

  // Check if current path is protected
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  useEffect(() => {
    if (!isLoading && isProtected && !isAuthenticated) {
      // Ensure cleanup runs only once
      tokenStorage.clearToken();
      // tokenStorage.clearAll();
      deleteAxiosDefaultToken();
      authDispatch({ type: "LOGOUT" });

      // Redirect to login page
      router.replace("/signin");
    }
  }, [isLoading, isProtected, isAuthenticated, authDispatch, router]);

  // Show loader while verifying auth or redirecting
  if (isProtected && (isLoading || (!isAuthenticated && typeof window !== "undefined"))) {
    return <PageLoader/>
  }

  return <>{children}</>;
}
