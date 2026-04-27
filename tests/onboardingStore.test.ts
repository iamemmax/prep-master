import { describe, it, expect, beforeEach } from "vitest";
import { useOnboardingStore } from "@/app/store/onboardingStore";

const ALICE = {
  first_name: "Ada",
  last_name: "Lovelace",
  email: "ada@example.com",
  password: "Secret123!",
};

const EXAM_STEP = {
  country: "Nigeria",
  preparing_for_exam: "JAMB",
  other_exam: "",
  exam_date: "2026-01-01",
  email: "ada@example.com",
};

const TARGET_STEP = {
  target_score: "1400",
  daily_study_hours: 2,
  current_level: "Intermediate",
  send_progress_report: true,
};

describe("onboardingStore — signup flow state", () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
    if (typeof window !== "undefined") {
      window.sessionStorage.clear();
      window.localStorage.clear();
    }
  });

  it("starts with empty slices", () => {
    const state = useOnboardingStore.getState();
    expect(state.userInfo).toEqual({});
    expect(state.examData).toEqual({});
    expect(state.targetData).toEqual({});
  });

  it("persists user info from step 1 (signup form)", () => {
    useOnboardingStore.getState().setUserInfo(ALICE);
    const { userInfo } = useOnboardingStore.getState();
    expect(userInfo.email).toBe(ALICE.email);
    expect(userInfo.first_name).toBe(ALICE.first_name);
    expect(userInfo.last_name).toBe(ALICE.last_name);
  });

  it("persists exam selections from step 2", () => {
    useOnboardingStore.getState().setExamData(EXAM_STEP);
    expect(useOnboardingStore.getState().examData).toEqual(EXAM_STEP);
  });

  it("persists targets from step 3", () => {
    useOnboardingStore.getState().setTargetData(TARGET_STEP);
    expect(useOnboardingStore.getState().targetData).toEqual(TARGET_STEP);
  });

  it("getFullPayload merges step 2 + step 3 into one object", () => {
    const store = useOnboardingStore.getState();
    store.setExamData(EXAM_STEP);
    store.setTargetData(TARGET_STEP);
    const payload = useOnboardingStore.getState().getFullPayload();
    expect(payload).toMatchObject({
      ...EXAM_STEP,
      ...TARGET_STEP,
    });
  });

  it("reset clears every slice (used on successful onboarding completion)", () => {
    const store = useOnboardingStore.getState();
    store.setUserInfo(ALICE);
    store.setExamData(EXAM_STEP);
    store.setTargetData(TARGET_STEP);

    useOnboardingStore.getState().reset();

    const state = useOnboardingStore.getState();
    expect(state.userInfo).toEqual({});
    expect(state.examData).toEqual({});
    expect(state.targetData).toEqual({});
  });
});
