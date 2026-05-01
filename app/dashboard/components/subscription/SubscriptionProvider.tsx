"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import UpgradeModal from "../upgrade/UpgradeModal";
import { useCreditBalance } from "../../util/hooks/useCreditBalance";

const LOW_CREDIT_THRESHOLD_PCT = 20;
const SESSION_DISMISSED_KEY = "subscription:low-credit-dismissed";

type SubscriptionContextValue = {
  remaining: number;
  total: number;
  percentRemaining: number;
  isLow: boolean;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { remaining, total } = useCreditBalance();
  // Only meaningful when there's a plan to be low against. Free users (total=0)
  // get isLow=false so the click-hijack doesn't paywall them out of their free
  // tier — they can still hit the Upgrade button explicitly.
  const percentRemaining = total > 0 ? (remaining / total) * 100 : 100;
  const isLow = total > 0 && percentRemaining <= LOW_CREDIT_THRESHOLD_PCT;

  // `dismissed` is hydrated from sessionStorage via a lazy initializer (no
  // effect, no cascading render). `manuallyOpen` lets other components force
  // the modal open even after the user dismissed the auto-popup.
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(SESSION_DISMISSED_KEY) === "true";
  });
  const [manuallyOpen, setManuallyOpen] = useState(false);

  const modalOpen = manuallyOpen || (isLow && !dismissed);

  const openUpgradeModal = useCallback(() => setManuallyOpen(true), []);

  const closeUpgradeModal = useCallback(() => {
    setManuallyOpen(false);
    setDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_DISMISSED_KEY, "true");
    }
  }, []);

  // While credits are low, intercept button clicks anywhere in the app and
  // open the upgrade modal instead. We skip clicks inside any open dialog (so
  // the modal's own buttons work) and any element opted out via
  // `data-no-paywall`. Capture phase ensures we run before component handlers.
  useEffect(() => {
    if (!isLow) return;

    const handler = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) return;
      if (target.closest('[role="dialog"]')) return;
      if (target.closest("[data-no-paywall]")) return;
      if (!target.closest('button, [role="button"]')) return;
      event.preventDefault();
      event.stopPropagation();
      setManuallyOpen(true);
    };

    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [isLow]);

  return (
    <SubscriptionContext.Provider
      value={{ remaining, total, percentRemaining, isLow, openUpgradeModal, closeUpgradeModal }}
    >
      {children}
      <UpgradeModal open={modalOpen} onClose={closeUpgradeModal} />
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return ctx;
}
