"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { getNames } from "country-list"
import { AxiosError } from "axios"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthStepHeader from "@/components/auth/auth-step-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Step1Data, step1Schema } from "../../schema/signup/userInfoSchema"
import { useOnboardingStore } from "@/app/store/onboardingStore"
import { useGetExamsByCountry } from "../../apis/signup/getExamsByCountry"
import { useCompleteOnboarding } from "../../apis/signup/completeOnbaording"
import { useErrorModalState } from "@/hooks"
import { ErrorModal } from "@/components/ui/ErrorModal"
import { formatAxiosErrorMessage } from "@/utils"
import { Spinner } from "@/components/ui/Spinner"

const COUNTRIES = getNames().sort((a, b) => a.localeCompare(b))

export default function SignupExamsPage() {
  const router = useRouter()
  const { setExamData, examData, userInfo, reset } = useOnboardingStore()
  const email = userInfo?.email ?? examData?.email ?? ""

  const {
    isErrorModalOpen,
    setErrorModalState,
    openErrorModalWithMessage,
    errorModalMessage,
  } = useErrorModalState()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      country: examData?.country ?? "",
      exam_type: examData?.exam_type,
      exam_name: examData?.exam_name ?? "",
      exam_date: examData?.exam_date ?? "",
    },
  })

  const selectedCountry = useWatch({ control, name: "country" })
  const selectedExamType = useWatch({ control, name: "exam_type" })

  const { data: examsResponse, isLoading: isLoadingExams } = useGetExamsByCountry(selectedCountry)
  const exams = examsResponse?.data ?? []

  const { mutate: submitOnboarding, isPending: isSkipping } = useCompleteOnboarding()

  function onSubmit(data: Step1Data) {
    setExamData({ ...data, email })
    router.push("/signup/target")
  }

  function onSkip() {
    submitOnboarding(
      {
        email,
        country: null,
        exam_type: null,
        exam_date: null,
        target_score: null,
        daily_study_hours: null,
        current_level: null,
        send_progress_report: null,
      },
      {
        onSuccess: () => {
          reset()
          router.push("/signup/success")
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.errors?.message ||
            error?.response?.data?.message ||
            formatAxiosErrorMessage(error as AxiosError) ||
            "An error occurred. Please try again."
          openErrorModalWithMessage(String(errorMessage))
        },
      }
    )
  }

  return (
    <div className="px-5">
      <AuthStepHeader
        backHref="/signup"
        backLabel="Back to home"
        stepLabel="Step 2 of 3 · Select all that apply"
        progress={2}
      />

      <section className="rounded-2xl border border-border bg-white p-6 sm:p-8">
        <h1 className="text-[24px] font-semibold text-[#0F172B]">Which exams are you preparing for?</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Tell us the exams you&apos;re preparing for and we&apos;ll tailor your experience
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>

          {/* Country */}
          <div>
            <label className="mb-2 block text-xs font-medium text-[#0F172A]">
              Which country are you taking exams from?
            </label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v)
                    // Reset exam selection when country changes — exam list will refetch
                    setValue("exam_type", undefined as unknown as number, { shouldValidate: false })
                    setValue("exam_name", "")
                  }}
                >
                  <SelectTrigger
                    className={`h-11 w-full bg-[#F8FAFC] text-sm ${
                      errors.country ? "border-red-500" : "border-input"
                    } ${!field.value ? "text-muted-foreground" : "text-[#0F172A]"}`}
                  >
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.country && (
              <p className="mt-1 text-xs text-red-400">{errors.country.message}</p>
            )}
          </div>

          {/* Exam — driven by country */}
          <div>
            <label className="mb-2 block text-xs font-medium text-[#0F172A]">
              What exams are you preparing for?
            </label>
            <Controller
              name="exam_type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(v) => {
                    const id = Number(v)
                    field.onChange(id)
                    const picked = exams.find((e) => e.id === id)
                    setValue("exam_name", picked?.name ?? "")
                  }}
                  disabled={!selectedCountry || isLoadingExams}
                >
                  <SelectTrigger
                    className={`h-11 w-full bg-[#F8FAFC] text-sm ${
                      errors.exam_type ? "border-red-500" : "border-input"
                    } ${!field.value ? "text-muted-foreground" : "text-[#0F172A]"}`}
                  >
                    <SelectValue
                      placeholder={
                        !selectedCountry
                          ? "Select a country first"
                          : isLoadingExams
                          ? "Loading exams..."
                          : exams.length === 0
                          ? "No exams available"
                          : "Select exam"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((e) => (
                      <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.exam_type && (
              <p className="mt-1 text-xs text-red-400">{errors.exam_type.message}</p>
            )}
            {selectedExamType ? (
              <p className="mt-1 text-xs text-[#94A3B8]">
                {exams.find((e) => e.id === selectedExamType)?.description}
              </p>
            ) : null}
          </div>

          {/* Exam date */}
          <div>
            <label className="mb-2 block text-xs font-medium text-[#0F172A]">
              When is your exam? (Optional)
            </label>
            <Input
              {...register("exam_date")}
              type="date"
              className="h-11 bg-[#F8FAFC] placeholder:text-xs"
            />
            {errors.exam_date && (
              <p className="mt-1 text-xs text-red-400">{errors.exam_date.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="mt-2 h-12 w-full rounded-lg text-base font-semibold text-white disabled:opacity-60"
          >
            Continue
          </Button>

          <button
            type="button"
            onClick={onSkip}
            disabled={isSkipping}
            className="mt-2 h-12 w-full flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-[#64748B] hover:text-[#0F172A] disabled:opacity-60"
          >
            {isSkipping ? <>Skipping <Spinner /></> : "Skip for now"}
          </button>
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
