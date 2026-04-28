// store/onboardingStore.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"
import z from "zod"
import { examOnboardingSchema, userOnboardingInfoSchema } from "../(auth)/schema/signup/userInfoSchema"

type ExamOnboardingData = z.infer<typeof examOnboardingSchema>
type UserInfoData = z.infer<typeof userOnboardingInfoSchema>

type Step1Data = Pick<ExamOnboardingData, "country" | "exam_type" | "exam_name" | "exam_date" | "email">
type Step2Data = Pick<ExamOnboardingData, "target_score" | "daily_study_hours" | "current_level" | "send_progress_report">

interface OnboardingStore {
  userInfo: Partial<UserInfoData>
  examData: Partial<Step1Data>
  targetData: Partial<Step2Data>
  setUserInfo: (data: Partial<UserInfoData>) => void
  setExamData: (data: Step1Data) => void
  setTargetData: (data: Step2Data) => void
  getFullPayload: () => Partial<ExamOnboardingData>
  reset: () => void
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      userInfo: {},
      examData: {},
      targetData: {},

      setUserInfo: (data: Partial<UserInfoData>) => set({ userInfo: data }),

      setExamData: (data: Step1Data) => set({ examData: data }),

      setTargetData: (data: Step2Data) => set({ targetData: data }),

      getFullPayload: (): Partial<ExamOnboardingData> => {
        const { examData, targetData } = get()
        return { ...examData, ...targetData }
      },

      reset: () => set({ userInfo: {}, examData: {}, targetData: {} }),
    }),
    {
      name: "onboarding-store", // localStorage key
      partialize: (state) => ({      // ✅ only persist data, not functions
        userInfo: state.userInfo,
        examData: state.examData,
        targetData: state.targetData,
      }),
    }
  )
)