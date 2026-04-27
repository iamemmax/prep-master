"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
// import z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthStepHeader from "@/components/auth/auth-step-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {  Step1Data, step1Schema } from "../../schema/signup/userInfoSchema"
import { useOnboardingStore } from "@/app/store/onboardingStore"

const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom", "United States"]
const EXAMS = ["WAEC", "JAMB", "NECO", "SAT", "IELTS", "TOEFL", "CPA", "PMP", "Other"]




export default function SignupExamsPage() {
  const router = useRouter()
  const { setExamData,examData } = useOnboardingStore() // save to shared store
const search = useSearchParams()
const email=search.get("email")
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
     country: examData?.country ?? "",
    preparing_for_exam: examData?.preparing_for_exam ?? "",
    other_exam: examData?.other_exam ?? "",
    exam_date: examData?.exam_date ?? "",
    },
  })

  const selectedExam = useWatch({ control, name: "preparing_for_exam" })

  function onSubmit(data: Step1Data) {
    setExamData({...data, email:String(email)}) // persist to store
    router.push("/signup/target")
  }

  return (
    <>
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
                <Select value={field.value} onValueChange={field.onChange}>
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

          {/* Exam */}
          <div>
            <label className="mb-2 block text-xs font-medium text-[#0F172A]">
              What exams are you preparing for?
            </label>
            <Controller
              name="preparing_for_exam"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={`h-11 w-full bg-[#F8FAFC] text-sm ${
                      errors.preparing_for_exam ? "border-red-500" : "border-input"
                    } ${!field.value ? "text-muted-foreground" : "text-[#0F172A]"}`}
                  >
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAMS.map((e) => (
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.preparing_for_exam && (
              <p className="mt-1 text-xs text-red-400">{errors.preparing_for_exam.message}</p>
            )}
          </div>

          {/* Other exam — only shown when "Other" is selected */}
          {selectedExam === "Other" && (
            <div>
              <label className="mb-2 block text-xs font-medium text-[#0F172A]">
                Please specify your exam
              </label>
              <Input
                {...register("other_exam")}
                className="h-11 bg-[#F8FAFC] placeholder:text-xs"
                placeholder="e.g. CPA, PMP, IELTS..."
              />
              {errors.other_exam && (
                <p className="mt-1 text-xs text-red-400">{errors.other_exam.message}</p>
              )}
            </div>
          )}

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
        </form>

        <p className="mt-8 text-center text-xs text-[#94A3B8]">
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-primary">Login</Link>
        </p>
      </section>
    </>
  )
}