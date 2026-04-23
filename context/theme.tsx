"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
export type Resolved = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  resolved: Resolved;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(t: Theme): Resolved {
  if (t !== "system") return t;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("prep:theme") as Theme) || "system";
  });
  const [resolved, setResolved] = useState<Resolved>(() => resolveTheme("system"));

  useEffect(() => {
    const next = resolveTheme(theme);
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    setResolved(next);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mm = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const next = mm.matches ? "dark" : "light";
      document.documentElement.classList.toggle("dark", next === "dark");
      document.documentElement.style.colorScheme = next;
      setResolved(next);
    };
    mm.addEventListener("change", handler);
    return () => mm.removeEventListener("change", handler);
  }, [theme]);

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

// Inline <script> string to avoid FOUC — injected into <head>
export const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('prep:theme') || 'system';
    var m = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = t === 'dark' || (t === 'system' && m);
    if (dark) document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch(e) {}
})();
`.trim();
