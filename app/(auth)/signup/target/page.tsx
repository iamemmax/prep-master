"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import AuthStepHeader from "@/components/auth/auth-step-header"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"

const STUDY_SLOTS = ["30 mins", "1+ hrs", "2+ hrs", "3+ hrs", "4+ hrs"] as const
const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const

export default function SignupTargetPage() {
  const router = useRouter()
  const [targetScore, setTargetScore] = useState(1400)
  const [studySlot, setStudySlot] = useState<(typeof STUDY_SLOTS)[number] | "">("1+ hrs")
  const [level, setLevel] = useState<(typeof LEVELS)[number] | "">("Intermediate")
  const [weeklyEmail, setWeeklyEmail] = useState(true)

  const scorePercent = useMemo(() => {
    const min = 400
    const max = 1600
    return ((targetScore - min) / (max - min)) * 100
  }, [targetScore])

  const canContinue = !!studySlot && !!level

  return (
    <>
      <AuthStepHeader
        backHref="/signup/exams"
        backLabel="Back to home"
        stepLabel="Step 3 of 3 · Personalize your study plan"
        progress={3}
      />

      <section className="rounded-2xl border border-border bg-white p-6 sm:p-8">
        <h1 className="text-[24px] font-semibold text-[#0F172B]">Set your target</h1>
        <p className="mt-1 text-sm text-[#64748B]">We&apos;ll build a study plan around your goals.</p>

        <div className="mt-6">
          <div className="text-xs font-medium text-[#0F172A]">Target score</div>
          <div className="mt-2 rounded-md bg-[#F8FAFC] px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-[24px] font-semibold text-[#0F172A]">{targetScore}</div>
              <span className="text-xs text-[#94A3B8]">SAT</span>
            </div>
            <Slider
              min={400}
              max={1600}
              step={10}
              value={[targetScore]}
              onValueChange={(value: number[]) => setTargetScore(value[0])}
              className="mt-3 w-full accent-(--color-accent) h-1.5 rounded-full bg-[#E2E8F0] [&_input]:w-full [&_input]:h-1.5 [&_input]:rounded-full [&_input]:bg-[#E2E8F0] [&_input]:accent-(--color-accent)"
            />
          </div>
        </div>

        <div className="mt-5">
          <div className="text-xs font-medium text-[#0F172A]">Daily study hours</div>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {STUDY_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setStudySlot(slot)}
                aria-pressed={studySlot === slot}
                className={[
                  "rounded-md border px-2 py-2 text-xs font-medium",
                  studySlot === slot
                    ? "border-primary/40 bg-primary/10 text-[#B7791F]"
                    : "border-border bg-[#F8FAFC] text-[#64748B]",
                ].join(" ")}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="text-xs font-medium text-[#0F172A]">Current level</div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {LEVELS.map((currentLevel) => (
              <button
                key={currentLevel}
                type="button"
                onClick={() => setLevel(currentLevel)}
                aria-pressed={level === currentLevel}
                className={[
                  "rounded-md border px-2 py-2 text-xs font-medium",
                  level === currentLevel
                    ? "border-primary/40 bg-primary/10 text-[#B7791F]"
                    : "border-border bg-[#F8FAFC] text-[#64748B]",
                ].join(" ")}
              >
                {currentLevel}
              </button>
            ))}
          </div>
        </div>

        <label className="mt-5 inline-flex items-center gap-2 text-xs text-[#94A3B8]">
          <Checkbox
            checked={weeklyEmail}
            onCheckedChange={(checked) => setWeeklyEmail(checked === true)}
            className="h-3.5 w-3.5 rounded border-border"
          />
          Send me weekly progress reports by email
        </label>

        <Button
          disabled={!canContinue}
          onClick={() => router.push("/signup/success")}
          className="mt-6 h-12 w-full rounded-lg text-base font-semibold text-white disabled:opacity-60"
        >
          Continue
        </Button>

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
