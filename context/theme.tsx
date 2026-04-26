"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type Theme = "light" | "dark" | "system";
export type Resolved = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  resolved: Resolved;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Dark mode is scoped to dashboard routes. Marketing/auth/legal pages always
// render in light mode regardless of the user's stored theme preference,
// because their hard-coded surface colors don't have dark equivalents and the
// dark CSS variables would wash out things like text-primary / text-foreground.
function isDarkScope(pathname: string | null | undefined): boolean {
  return !!pathname && pathname.startsWith("/dashboard");
}

function resolveTheme(t: Theme): Resolved {
  if (t !== "system") return t;
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("prep:theme") as Theme) || "dark";
  });
  const [resolved, setResolved] = useState<Resolved>(() => resolveTheme("dark"));

  useEffect(() => {
    const next = isDarkScope(pathname) ? resolveTheme(theme) : "light";
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    setResolved(next);
  }, [theme, pathname]);

  useEffect(() => {
    if (theme !== "system" || !isDarkScope(pathname)) return;
    const mm = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const next = mm.matches ? "dark" : "light";
      document.documentElement.classList.toggle("dark", next === "dark");
      document.documentElement.style.colorScheme = next;
      setResolved(next);
    };
    mm.addEventListener("change", handler);
    return () => mm.removeEventListener("change", handler);
  }, [theme, pathname]);

  const setTheme = (t: Theme) => {
    localStorage.setItem("prep:theme", t);
    setThemeState(t);
  };
  const toggle = () => setTheme(resolved === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

// Inline <script> string to avoid FOUC — injected into <head>.
// Dark mode is gated to /dashboard routes so the marketing site stays light.
export const themeInitScript = `
(function(){
  try {
    var inDashboard = window.location.pathname.indexOf('/dashboard') === 0;
    var t = localStorage.getItem('prep:theme') || 'dark';
    var m = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = inDashboard && (t === 'dark' || (t === 'system' && m));
    if (dark) document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch(e) {}
})();
`.trim();
