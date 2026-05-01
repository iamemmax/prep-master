"use client";

import { useUserSubscription } from "../apis/subscription/subscription";

/**
 * Reads the user's AI-credit balance from the active subscription.
 *
 * - When subscribed: `remaining` = `ai_credits_remaining`, `total` = the
 *   plan's `ai_credits` quota (so the percentage progress bar is accurate).
 * - When unsubscribed: returns `{ 0, 0 }` so the SubscriptionProvider's
 *   low-credit paywall fires (this is the same as a depleted balance).
 * - While the subscription query is still loading we return `{ 1, 1 }` —
 *   100% of 1 credit — so the paywall doesn't flash before we know whether
 *   the user is actually low on credits.
 */
export function useCreditBalance(): { remaining: number; total: number } {
  const { data, isLoading } = useUserSubscription();

  if (isLoading) return { remaining: 1, total: 1 };

  const sub = data?.data?.subscription;
  if (!data?.data?.is_subscribed || !sub) return { remaining: 0, total: 0 };

  const remaining = Number(sub.ai_credits_remaining ?? 0);
  const total = Number(sub.plan?.ai_credits ?? 0);
  // If the plan has no AI quota at all (free tier subscription record), report
  // {0, 0} so the SubscriptionProvider treats the user as "no plan to be low
  // against" — otherwise the auto-paywall would fire on every click.
  if (total <= 0 && remaining <= 0) return { remaining: 0, total: 0 };
  // Divide-by-zero guard: only kicks in when the backend returns leftover
  // credits with no declared total (rare data inconsistency).
  return { remaining, total: total > 0 ? total : remaining };
}
