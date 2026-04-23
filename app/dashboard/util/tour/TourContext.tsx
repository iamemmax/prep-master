"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TOURS, TourId, TourStep } from "./tourSteps";

const completionKey = (id: TourId) => `prep:tour_${id}_completed`;
const LEGACY_KEY = "prep:tour_completed"; // pre-refactor global flag

interface TourContextValue {
  // Current runtime state
  active: boolean;
  activeTourId: TourId | null;
  stepIndex: number;
  totalSteps: number;
  currentStep: TourStep | null;

  // Imperative controls
  startTour: (id: TourId) => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
  finish: () => void;

  // Welcome modal (dashboard-only, first visit)
  welcomeOpen: boolean;
  closeWelcome: () => void;

  // Persistence queries
  hasSeenTour: (id: TourId) => boolean;
  resetTour: (id: TourId) => void;
}

const TourContext = createContext<TourContextValue | null>(null);

function readSeen(id: TourId): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem(completionKey(id)) === "true") return true;
    // Honor the legacy flag so existing users who completed the old tour
    // don't get re-onboarded on every page.
    if (id === "dashboard" && localStorage.getItem(LEGACY_KEY) === "true") return true;
  } catch { /* noop */ }
  return false;
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [activeTourId, setActiveTourId] = useState<TourId | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  // Track "seen" state in React so Replay buttons re-render after reset.
  const [seenVersion, setSeenVersion] = useState(0);

  const steps = activeTourId ? TOURS[activeTourId] : [];
  const currentStep = steps[stepIndex] ?? null;
  const active = activeTourId !== null && currentStep !== null;

  // Auto-open welcome on first dashboard visit.
  const [dashboardSeen] = useState<boolean>(() => readSeen("dashboard"));
  useEffect(() => {
    if (dashboardSeen) return;
    const t = setTimeout(() => setWelcomeOpen(true), 600);
    return () => clearTimeout(t);
  }, [dashboardSeen]);

  const startTour = useCallback((id: TourId) => {
    setWelcomeOpen(false);
    setActiveTourId(id);
    setStepIndex(0);
    const first = TOURS[id][0];
    if (first?.route && typeof window !== "undefined" && window.location.pathname !== first.route) {
      router.push(first.route);
    }
  }, [router]);

  const next = useCallback(() => {
    setStepIndex(i => {
      if (!activeTourId) return i;
      const all = TOURS[activeTourId];
      const nextI = Math.min(i + 1, all.length - 1);
      const step = all[nextI];
      if (step?.route && typeof window !== "undefined" && window.location.pathname !== step.route) {
        router.push(step.route);
      }
      return nextI;
    });
  }, [router, activeTourId]);

  const prev = useCallback(() => {
    setStepIndex(i => {
      if (!activeTourId) return i;
      const all = TOURS[activeTourId];
      const prevI = Math.max(i - 1, 0);
      const step = all[prevI];
      if (step?.route && typeof window !== "undefined" && window.location.pathname !== step.route) {
        router.push(step.route);
      }
      return prevI;
    });
  }, [router, activeTourId]);

  const markCompleted = useCallback((id: TourId) => {
    try { localStorage.setItem(completionKey(id), "true"); } catch { /* noop */ }
    setSeenVersion(v => v + 1);
  }, []);

  const skip = useCallback(() => {
    if (activeTourId) markCompleted(activeTourId);
    setActiveTourId(null);
    setStepIndex(0);
    setWelcomeOpen(false);
  }, [activeTourId, markCompleted]);

  const finish = useCallback(() => {
    if (activeTourId) markCompleted(activeTourId);
    setActiveTourId(null);
    setStepIndex(0);
  }, [activeTourId, markCompleted]);

  const closeWelcome = useCallback(() => { setWelcomeOpen(false); }, []);
  const hasSeenTour = useCallback(
    (id: TourId) => { void seenVersion; return readSeen(id); },
    [seenVersion],
  );
  const resetTour = useCallback((id: TourId) => {
    try {
      localStorage.removeItem(completionKey(id));
      if (id === "dashboard") localStorage.removeItem(LEGACY_KEY);
    } catch { /* noop */ }
    setSeenVersion(v => v + 1);
  }, []);

  // Global keyboard shortcuts — only when a tour is active.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")          { skip(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft")  { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, next, prev, skip]);

  return (
    <TourContext.Provider
      value={{
        active,
        activeTourId,
        stepIndex,
        totalSteps: steps.length,
        currentStep,
        startTour,
        next,
        prev,
        skip,
        finish,
        welcomeOpen,
        closeWelcome,
        hasSeenTour,
        resetTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within TourProvider");
  return ctx;
}

/**
 * Drop into any page: auto-starts the named tour on first visit only.
 * Respects the current dashboard-visit gate — won't stack with other tours.
 */
export function TourAutoStart({ tourId, delayMs = 500 }: { tourId: TourId; delayMs?: number }) {
  const { active, hasSeenTour, startTour, welcomeOpen } = useTour();
  useEffect(() => {
    if (active || welcomeOpen) return;
    if (hasSeenTour(tourId)) return;
    // Dashboard tour takes priority; if the user hasn't seen dashboard yet,
    // let the welcome/dashboard flow run first.
    if (tourId !== "dashboard" && !hasSeenTour("dashboard")) return;
    const t = setTimeout(() => startTour(tourId), delayMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId]);
  return null;
}
