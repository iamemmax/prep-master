// store/onboardingStore.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"
import z from "zod"
import { examOnboardingSchema } from "../(auth)/schema/signup/userInfoSchema"

type ExamOnboardingData = z.infer<typeof examOnboardingSchema>

type Step1Data = Pick<ExamOnboardingData, "country" | "preparing_for_exam" | "other_exam" | "exam_date" | "email">
type Step2Data = Pick<ExamOnboardingData, "target_score" | "daily_study_hours" | "current_level" | "send_progress_report">

interface OnboardingStore {
  examData: Partial<Step1Data>
  targetData: Partial<Step2Data>
  setExamData: (data: Step1Data) => void
  setTargetData: (data: Step2Data) => void
  getFullPayload: () => Partial<ExamOnboardingData>
  reset: () => void
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      examData: {},
      targetData: {},

      setExamData: (data: Step1Data) => set({ examData: data }),

      setTargetData: (data: Step2Data) => set({ targetData: data }),

      getFullPayload: (): Partial<ExamOnboardingData> => {
        const { examData, targetData } = get()
        return { ...examData, ...targetData }
      },

      reset: () => set({ examData: {}, targetData: {} }),
    }),
    {
      name: "onboarding-store", // localStorage key
      partialize: (state) => ({      // ✅ only persist data, not functions
        examData: state.examData,
        targetData: state.targetData,
      }),
    }
  )
)