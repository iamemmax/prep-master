import { adminAxios } from "@/lib/axios";
import { QUERYKEY } from "@/key/queryKey";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Shared shapes ───────────────────────────────────────────────────────────
export interface SubscriptionPlan {
  id: number;
  reference: string;
  name: string;
  tier: string;
  price: string;
  currency: string;
  duration_days: number;
  question_limit: number;
  ai_credits: number;
  description: string;
  features: string[];
}

export interface UserSubscription {
  id: number;
  reference: string;
  plan: SubscriptionPlan;
  start_date: string;
  end_date: string;
  status: string;
  ai_credits_remaining: number;
  days_remaining: number;
  is_valid: boolean;
  created_at: string;
  updated_at: string;
}

interface ListResp<T> {
  status: string;
  data: T;
  count?: number;
  next?: string | null;
  previous?: string | null;
  message: string;
}

// ─── Plans ───────────────────────────────────────────────────────────────────
const fetchSubscriptionPlans = async () => {
  const res = await adminAxios.get<ListResp<SubscriptionPlan[]>>(
    "/api/v1/payments/subscriptions/plans/",
  );
  return res.data;
};

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: QUERYKEY.SUBSCRIPTION_PLANS,
    queryFn: fetchSubscriptionPlans,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// ─── Current user subscription ───────────────────────────────────────────────
interface UserSubscriptionResp {
  status: string;
  data: {
    is_subscribed: boolean;
    subscription: UserSubscription | null;
  };
  message: string;
}

const fetchUserSubscription = async () => {
  const res = await adminAxios.get<UserSubscriptionResp>(
    "/api/v1/payments/subscriptions/",
  );
  return res.data;
};

export const useUserSubscription = () => {
  return useQuery({
    queryKey: QUERYKEY.USER_SUBSCRIPTION,
    queryFn: fetchUserSubscription,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// ─── Initiate payment (Paystack) ─────────────────────────────────────────────
export interface InitiatePaymentResp {
  status: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
    plan: SubscriptionPlan;
  };
  message: string;
}

const initiatePayment = async (planId: number | string) => {
  const res = await adminAxios.post<InitiatePaymentResp>(
    "/api/v1/payments/subscriptions/initiate/",
    { plan_id: String(planId) },
  );
  return res.data;
};

export const useInitiatePayment = () => {
  return useMutation({
    mutationFn: initiatePayment,
  });
};

// ─── Verify payment (after Paystack redirect) ────────────────────────────────
export interface VerifyPaymentResp {
  status: string;
  data: {
    payment_status: string;
    subscription: UserSubscription;
  };
  message: string;
}

const verifyPayment = async (reference: string) => {
  const res = await adminAxios.get<VerifyPaymentResp>(
    `/api/v1/payments/subscriptions/verify/${reference}/`,
  );
  return res.data;
};

export const useVerifyPayment = (reference: string | null) => {
  return useQuery({
    queryKey: ["subscription-verify", reference],
    queryFn: () => verifyPayment(reference as string),
    enabled: !!reference,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/** Invalidate the user-subscription cache so the dashboard picks up a new plan. */
export const useInvalidateUserSubscription = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: QUERYKEY.USER_SUBSCRIPTION });
};
