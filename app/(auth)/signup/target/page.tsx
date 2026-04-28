"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import AuthStepHeader from "@/components/auth/auth-step-header"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import {  Step2Data, step2Schema } from "../../schema/signup/userInfoSchema"
// import { useCompleteOnboarding } from "../../apis/signup/verifyUser"
import { useOnboardingStore } from "@/app/store/onboardingStore"
import { useCompleteOnboarding } from "../../apis/signup/completeOnbaording"
import { useErrorModalState } from "@/hooks"
import { formatAxiosErrorMessage } from "@/utils"
import { AxiosError } from "axios"
import { ErrorModal } from "@/components/ui/ErrorModal"

const STUDY_SLOTS = ["30 mins", "1+ hrs", "2+ hrs", "3+ hrs", "4+ hrs"] as const
const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const






export default function SignupTargetPage() {
     const {
        isErrorModalOpen,
        setErrorModalState,
        openErrorModalWithMessage,
        errorModalMessage,
      } = useErrorModalState();
  const router = useRouter()
  const { examData, targetData, userInfo, reset } = useOnboardingStore() // retrieve step 1 data
  const { mutate: submitOnboarding, isPending } = useCompleteOnboarding()

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      target_score: targetData?.target_score ?? "1400",
    daily_study_hours: targetData?.daily_study_hours ?? 1,
    current_level: targetData?.current_level ?? "Intermediate",
    send_progress_report: targetData?.send_progress_report ?? true,
    },
  })

 function onSubmit(data: Step2Data) {
  const email = userInfo?.email ?? examData?.email ?? ""

  // ✅ Guard ensures required step-1 fields exist before submitting
  if (!email || !examData?.country || !examData?.exam_type || !examData?.exam_date) {
    router.push(email ? "/signup/exams" : "/signup")
    return
  }

  const fullPayload = {
    email,
    country: examData.country,
    exam_type: examData.exam_type,
    exam_date: examData.exam_date,
    target_score: data.target_score,
    daily_study_hours: data.daily_study_hours,
    current_level: data.current_level,
    send_progress_report: data.send_progress_report,
  }

  submitOnboarding(fullPayload, {
    onSuccess: () =>{
      reset()
      router.push("/signup/success")
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError:(error:any)=>{
           const errorMessage = error?.response?.data?.errors?.message
                      || error?.response?.data?.message
                      || formatAxiosErrorMessage(error as AxiosError)
                      || 'An error occurred. Please try again.';
                  openErrorModalWithMessage(String(errorMessage));
                openErrorModalWithMessage(String(errorMessage));
        },
  })
}

  return (
    <div className="px-5">
      <AuthStepHeader
        backHref="/signup/exams"
        backLabel="Back"
        stepLabel="Step 3 of 3 · Personalize your study plan"
        progress={3}
      />

      <section className="rounded-2xl border border-border bg-white p-6 sm:p-8">
        <h1 className="text-[24px] font-semibold text-[#0F172B]">Set your target</h1>
        <p className="mt-1 text-sm text-[#64748B]">We&apos;ll build a study plan around your goals.</p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>

          {/* Target score slider */}
          <div>
            <div className="text-xs font-medium text-[#0F172A]">Target score</div>
            <Controller
              name="target_score"
              control={control}
              render={({ field }) => (
                <div className="mt-2 rounded-md bg-[#F8FAFC] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[24px] font-semibold text-[#0F172A]">{field.value}</div>
                    <span className="text-xs text-[#94A3B8]">
                      {examData?.exam_name}
                    </span>
                  </div>
                  <Slider
                    min={400}
                    max={1600}
                    step={10}
                    value={[Number(field.value)]}
                    onValueChange={(val) => field.onChange(String(val[0]))}
                    className="mt-3 w-full"
                  />
                </div>
              )}
            />
          </div>

          {/* Daily study hours */}
          <div>
            <div className="text-xs font-medium text-[#0F172A]">Daily study hours</div>
            <Controller
              name="daily_study_hours"
              control={control}
              render={({ field }) => (
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {STUDY_SLOTS.map((slot, i) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => field.onChange(i + 1)} // 1-5 mapped to slots
                      className={[
                        "rounded-md border px-2 py-2 text-xs font-medium transition-colors",
                        field.value === i + 1
                          ? "border-primary/40 bg-primary/10 text-[#B7791F]"
                          : "border-border bg-[#F8FAFC] text-[#64748B]",
                      ].join(" ")}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.daily_study_hours && (
              <p className="mt-1 text-xs text-red-400">{errors.daily_study_hours.message}</p>
            )}
          </div>

          {/* Current level */}
          <div>
            <div className="text-xs font-medium text-[#0F172A]">Current level</div>
            <Controller
              name="current_level"
              control={control}
              render={({ field }) => (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => field.onChange(lvl)}
                      className={[
                        "rounded-md border px-2 py-2 text-xs font-medium transition-colors",
                        field.value === lvl
                          ? "border-primary/40 bg-primary/10 text-[#B7791F]"
                          : "border-border bg-[#F8FAFC] text-[#64748B]",
                      ].join(" ")}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.current_level && (
              <p className="mt-1 text-xs text-red-400">{errors.current_level.message}</p>
            )}
          </div>

          {/* Progress report checkbox */}
          <Controller
            name="send_progress_report"
            control={control}
            render={({ field }) => (
              <label className="inline-flex items-center gap-2 text-xs text-[#94A3B8]">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  className="h-3.5 w-3.5 rounded border-border"
                />
                Send me weekly progress reports by email
              </label>
            )}
          />

          <Button
            type="submit"
            disabled={isPending}
            className="h-12 w-full rounded-lg text-base font-semibold text-white disabled:opacity-60"
          >
            {isPending ? "Submitting..." : "Continue"}
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-[#94A3B8]">
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-primary">Login</Link>
        </p>
      </section>

      <ErrorModal
                  isErrorModalOpen={isErrorModalOpen}
                  setErrorModalState={() => setErrorModalState(false)}
                  subheading={errorModalMessage || "Please check your inputs and try again."}
                />
    </div>
  )
}