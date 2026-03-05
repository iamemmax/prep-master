"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthStepHeader from "@/components/auth/auth-step-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom", "United States"]
const EXAMS = ["WAEC", "JAMB", "NECO", "SAT", "IELTS", "TOEFL", "CPA", "PMP", "Other"]

export default function SignupExamsPage() {
  const router = useRouter()
  const [country, setCountry] = useState("")
  const [exam, setExam] = useState("")
  const [otherExam, setOtherExam] = useState("")
  const [examDate, setExamDate] = useState("")

  const canContinue = useMemo(() => {
    if (!country || !exam) return false
    if (exam === "Other" && otherExam.trim().length < 2) return false
    return true
  }, [country, exam, otherExam])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canContinue) return
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
        <h1 className="text-[24px] font-semibold text-[#0F172B]">Which exams are you preparing for ?</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Tell us the exams you&apos;re preparing for and we&apos;ll tailor your experience
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-xs font-medium text-[#0F172A]">
              Which country are you taking exams from ?
            </label>
            <Select
              value={country}
              onValueChange={(value) => setCountry(value)}
            >
              <SelectTrigger className="placeholder:text-[8px] h-11 w-full rounded-md border border-input bg-[#F8FAFC] px-3 text-sm text-[#0F172A] outline-none focus-visible:border-ring focus-visible:ring-[1px] focus-visible:ring-ring/50">
                <SelectValue placeholder="Select country" className="text-xs" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-[#0F172A]">
              What exams are you preparing for ?
            </label>
            <Select
              value={exam}
              onValueChange={(value) => setExam(value)}
            >
              <SelectTrigger className="h-11 w-full rounded-md border border-input bg-[#F8FAFC] px-3 text-sm text-[#0F172A] outline-none focus-visible:border-ring focus-visible:ring-[1px] focus-visible:ring-ring/50">
                <SelectValue placeholder="Select exam" />
              </SelectTrigger>
              <SelectContent>
                {EXAMS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-[#0F172A]">
              Other exam (Optional)
            </label>
            <Input
              value={otherExam}
              onChange={(e) => setOtherExam(e.target.value)}
              className="h-11 bg-[#F8FAFC] placeholder:text-xs "
              placeholder="e.g. CPA, PMP, IELTS..."
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-[#0F172A]">
              When is your exams ? (Optional)
            </label>
            <Input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="h-11 bg-[#F8FAFC] placeholder:text-xs "
            />
          </div>

          <Button type="submit" disabled={!canContinue} className="mt-2 h-12 w-full rounded-lg text-base font-semibold text-white disabled:opacity-60">
            Continue
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-[#94A3B8]">
          Already have an account ?{" "}
          <Link href="/signin" className="font-medium text-primary">
            Login
          </Link>
        </p>
      </section>

      <p className="mt-8 text-center text-xs text-[#94A3B8]">
        Having an issues,{" "}
        <Link href="/support" className="font-medium text-primary underline underline-offset-2">
          speak with support
        </Link>
      </p>
    </>
  )
}
