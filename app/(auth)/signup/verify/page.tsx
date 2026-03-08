"use client"

import Link from "next/link"
import { useRef, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, Info } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import AuthStepHeader from "@/components/auth/auth-step-header"
import { Input } from "@/components/ui/input"
import { useErrorModalState } from "@/hooks"
import { formatAxiosErrorMessage } from "@/utils"
import { AxiosError } from "axios"
import { SmallSpinner, Spinner } from "@/components/ui/Spinner"
import { ErrorModal } from "@/components/ui/ErrorModal"
import { useResendOtp } from "../../apis/signup/resendOtp"
import toast from "react-hot-toast"
import { useVerifyUser } from "../../apis/signup/verifyUser"

const otpSchema = z.object({
  otp_code: z
    .array(z.string().length(1, "Required").regex(/^\d$/, "Must be a digit"))
    .length(6)
    .refine((arr) => arr.every((d) => /^\d$/.test(d)), {
      message: "Please enter all 6 digits",
    }),
})

type OtpFormData = z.infer<typeof otpSchema>

const COUNTDOWN = 14 * 60 + 32 // 14:32 in seconds


export default function SignupVerifyPage() {
  const {
    isErrorModalOpen,
    setErrorModalState,
    openErrorModalWithMessage,
    errorModalMessage,
  } = useErrorModalState();
  const search = useSearchParams()
  const email = search?.get("email")
  const router = useRouter()
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN)
  const expired = timeLeft === 0

  // Countdown timer
  useEffect(() => {
    if (expired) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [expired])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

 
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp_code: ["", "", "", "", "", ""] },
  })

  function handleChange(index: number, value: string, onChange: (val: string) => void) {
    const digit = value.replace(/\D/g, "").slice(-1)
    onChange(digit)
    if (digit && index < 5) inputsRef.current[index + 1]?.focus()
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !getValues(`otp_code.${index}`) && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const { mutate: handleResendOtp, isPending:isResendingOtp } = useResendOtp()
  const { mutate: handleVerify, isPending } = useVerifyUser()
  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (!pasted) return
    pasted.split("").forEach((char, idx) => setValue(`otp_code.${idx}`, char))
    inputsRef.current[Math.min(pasted.length, 5)]?.focus()
  }

  const onSubmit = (data: OtpFormData) => {
    const code = data.otp_code.join("")
    handleVerify({
      email: email as string,
      otp_code: String(code)
    }, {
      onSuccess: () => {
        router.push(`/signup/exams?email=${email}`)

      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.errors?.message
          || error?.response?.data?.message
          || formatAxiosErrorMessage(error as AxiosError)
          || 'An error occurred. Please try again.';
        openErrorModalWithMessage(String(errorMessage));
        openErrorModalWithMessage(String(errorMessage));
      }
    })
  }
function handleResend() {
  if (!expired || isResendingOtp) return;

  handleResendOtp(String(email), {
    onSuccess: () => {
      setTimeLeft(COUNTDOWN) // ✅ only reset timer on success
      toast.success(`OTP sent successfully to ${email}`)
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.errors?.message ||
        error?.response?.data?.message ||
        formatAxiosErrorMessage(error as AxiosError) ||
        "An error occurred. Please try again."
      openErrorModalWithMessage(String(errorMessage)) // ✅ removed duplicate
    },
  })
}

  return (
    <div className="max-md:px-5">
      <AuthStepHeader backHref="/signup" backLabel="Back to sign up" progress={1} />

      <section className="rounded-2xl border border-border bg-white p-6 sm:p-8 mt-10">
        <div className="grid h-16 w-16 place-items-center rounded-full border border-primary/25 bg-primary/5 text-primary">
          <Mail className="h-7 w-7" />
        </div>

        <h1 className="mt-5 text-[24px] font-semibold font-inter text-[#0F172B]">Check your inbox</h1>
        <p className="mt-1 text-base leading-relaxed  font-intermax-w-md text-[#64748B]">
          We&apos;ve sent a 6-digits verification code to your email address{" "}
          <span className="font-medium text-[#0F172A]">{email}</span>{" "}
          <Link href="/signup" className="ml-1 text-primary">Change email</Link>
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-6">
            <div className="mb-3 text-sm font-medium text-[#0F172A]">Enter the 6-digit code</div>
            <div className="flex gap-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Controller
                  key={idx}
                  control={control}
                  name={`otp_code.${idx}`}
                  render={({ field }) => (
                    <Input
                      {...field}
                      ref={(el) => { inputsRef.current[idx] = el; field.ref(el) }}
                      onChange={(e) => handleChange(idx, e.target.value, field.onChange)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      maxLength={1}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      className={[
                        "h-10 md:h-14 w-10 md:w-14 rounded-md border text-center text-2xl md:text-3xl font-medium text-[#0F172A] outline-none transition-colors",
                        field.value ? "border-primary/40 bg-primary/5" : "border-border bg-[#F8FAFC]",
                        "focus:border-primary/40 focus:bg-primary/5",
                        errors.otp_code ? "border-red-400" : "",
                      ].join(" ")}
                    />
                  )}
                />
              ))}
            </div>

            {errors.otp_code && (
              <p className="mt-2 text-xs text-red-400">
                {errors.otp_code.message ?? "Please enter all 6 digits"}
              </p>
            )}

            {/* ✅ Countdown timer */}
            <p className="mt-3 text-xs text-[#94A3B8]">
              {expired ? (
                <span className="text-red-400">Code expired</span>
              ) : (
                <>Code expires in <span className="font-medium text-[#0F172A]">{formatTime(timeLeft)}</span></>
              )}
            </p>
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-md  border-[0.8px] border-[#ECB22E99]/60 px-3 py-2 text-xs text-[#ECB22E]">
            <Info className="h-3.5 w-3.5" />
            Didn&apos;t get the code? Check spam or resend below
          </div>

          <Button
            type="submit"
            className="mt-10 h-12 w-full rounded-lg text-sm font-semibold flex justify-center items-center gap-3 text-white disabled:opacity-60"
          >
            Verify &amp; Continue {isPending && <Spinner />}
          </Button>
        </form>

        {/* ✅ Resend disabled until expired */}
        <p className="mt-5 text-center text-xs">
  {expired ? (
    <button
    type="button"
      onClick={handleResend}
      disabled={isResendingOtp}
      className="font-medium text-primary inline-flex items-center gap-2 hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
    >
      Resend code {isResendingOtp && <SmallSpinner />}
    </button>
  ) : (
    <span className="text-[#94A3B8] cursor-not-allowed">
      Resend code ({formatTime(timeLeft)})
    </span>
  )}
</p>

        <p className="mt-12 text-center text-xs text-[#94A3B8]">
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-primary">Login</Link>
        </p>
      </section>

      <p className="mt-8 text-center text-xs text-[#94A3B8]">
        Having an issue?{" "}
        <Link href="/support" className="font-medium text-primary underline underline-offset-2">
          speak with support
        </Link>
      </p>

      <ErrorModal
        isErrorModalOpen={isErrorModalOpen}
        setErrorModalState={() => setErrorModalState(false)}
        subheading={errorModalMessage || "Please check your inputs and try again."}
      />
    </div>
  )
}