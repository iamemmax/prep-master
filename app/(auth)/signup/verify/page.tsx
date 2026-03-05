"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import AuthStepHeader from "@/components/auth/auth-step-header"

export default function SignupVerifyPage() {
  const router = useRouter()
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const otpComplete = otp.every((digit) => digit.length === 1)

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)

    if (digit && index < next.length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (!pasted) return

    const next = ["", "", "", "", "", ""]
    pasted.split("").forEach((char, idx) => {
      next[idx] = char
    })
    setOtp(next)
    inputsRef.current[Math.min(pasted.length, 5)]?.focus()
  }

  return (
    <>
      <AuthStepHeader backHref="/signup" backLabel="Back to sign up" progress={1} />

      <section className="rounded-2xl border border-border bg-white p-6 sm:p-8">
        <div className="grid h-16 w-16 place-items-center rounded-full border border-primary/25 bg-primary/5 text-primary">
          <Mail className="h-7 w-7" />
        </div>

        <h1 className="mt-5 text-[24px] font-semibold text-[#0F172B]">Check your inbox</h1>
        <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
          We&apos;ve sent a 6-digits verification code to your email address{" "}
          <span className="font-medium text-[#0F172A]">name@email.com</span>{" "}
          <Link href="/signup" className="ml-1 text-primary">
            Change email
          </Link>
        </p>

        <div className="mt-6">
          <div className="mb-3 text-sm font-medium text-[#0F172A]">Enter the 6-digit code</div>
          <div className="flex gap-3">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputsRef.current[idx] = el
                }}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                maxLength={1}
                inputMode="numeric"
                autoComplete="one-time-code"
                className={[
                  "h-10 md:h-14 w-10 md:w-14 rounded-md border text-center text-2xl md:text-3xl font-semibold text-[#0F172A] outline-none transition-colors",
                  digit
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-[#F8FAFC] text-[#0F172A]",
                  "focus:border-primary/40 focus:bg-primary/5",
                ].join(" ")}
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-[#94A3B8]">Code expires in 14:32</p>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-md border border-primary/40 bg-primary/5 px-3 py-2 text-xs text-[#B7791F]">
          <Info className="h-3.5 w-3.5" />
          Didn&apos;t get the code ? Check spam or resend below
        </div>

        <Button
          disabled={!otpComplete}
          onClick={() => router.push("/signup/exams")}
          className="mt-5 h-12 w-full rounded-lg text-sm font-semibold text-white disabled:opacity-60"
        >
          Verify & Continue
        </Button>

        <p className="mt-5 text-center text-xs">
          <Link href="#" className="font-medium text-primary">
            Resend code
          </Link>
        </p>

        <p className="mt-12 text-center text-xs text-[#94A3B8]">
          Already have an account?{" "}
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
