"use client"

import Link from "next/link"
import { CheckCircle2, Circle, Eye, EyeOff, Lock } from "lucide-react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import AuthStepHeader from "@/components/auth/auth-step-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useErrorModalState } from "@/hooks"
import { useSetNewPassword } from "../apis/password/setNewPassword"
import { formatAxiosErrorMessage } from "@/utils"
import { AxiosError } from "axios"
import { ErrorModal } from "@/components/ui/ErrorModal"
import { SmallSpinner } from "@/components/ui/Spinner"
import toast from "react-hot-toast"

const resetPasswordSchema = z
  .object({
    new_password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "One uppercase letter (A-Z)")
      .regex(/[0-9\W]/, "One number or symbol"),
    confirm: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.new_password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  })

type ResetPasswordData = z.infer<typeof resetPasswordSchema>

function Rule({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {ok ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <Circle className="h-3.5 w-3.5 text-[#CBD5E1]" />
      )}
      <span className={ok ? "text-emerald-700" : "text-[#94A3B8]"}>{text}</span>
    </div>
  )
}

export default function ForgotPasswordResetPage() {
  const {
    isErrorModalOpen,
    setErrorModalState,
    openErrorModalWithMessage,
    errorModalMessage,
  } = useErrorModalState();
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    control,

    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: { new_password: "", confirm: "" },
  })

const password = useWatch({ control, name: "new_password" }) ?? ""

  const rules = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    numberOrSymbol: /[0-9\W]/.test(password),
  }
  const { mutate: setNewPassword, isPending } = useSetNewPassword()
const search = useSearchParams()
const token = search.get("token")
  const onSubmit = ({ new_password }: ResetPasswordData) => {
    if (!token) {
      openErrorModalWithMessage("Invalid token");
      return;
    }
    const payload = {
      new_password,
      token: String(token)
    }
    setNewPassword(payload, {
      onSuccess: () => {
        toast.success("Password change successfully")
        router.replace("/signin")
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.errors?.message
          || error?.response?.data?.message
          || formatAxiosErrorMessage(error as AxiosError)
          || 'An error occurred. Please try again.';
        openErrorModalWithMessage(String(errorMessage));
      },
    })
  }

  return (
    <>
      <AuthStepHeader backHref="/signin" backLabel="Back to login" showProgress={false} />

      <section className="rounded-2xl border border-border bg-white p-6 sm:p-8">
        <div className="grid h-14 w-14 place-items-center rounded-full border border-primary/35 bg-primary/5 text-primary">
          <Lock className="h-5 w-5" />
        </div>

        <h1 className="mt-5 text-4xl font-semibold text-[#0F172A]">Create a new password</h1>
        <p className="mt-2 text-sm text-[#64748B]">No worries, we&apos;ll send you a reset link.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>

          {/* New password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#0F172A]">New password</label>
            <div className="relative">
              <Input
                {...register("new_password")}
                type={showPassword ? "text" : "password"}
                className={`h-11 bg-[#F8FAFC] pr-12 ${errors.new_password ? "border-red-500" : ""}`}
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="mt-3 space-y-1.5">
              <Rule ok={rules.minLength} text="At least 8 characters" />
              <Rule ok={rules.uppercase} text="One uppercase letter (A-Z)" />
              <Rule ok={rules.numberOrSymbol} text="One number or symbol" />
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#0F172A]">Confirm new password</label>
            <div className="relative">
              <Input
                {...register("confirm")}
                type={showConfirm ? "text" : "password"}
                className={`h-11 bg-[#F8FAFC] pr-12 ${errors.confirm ? "border-red-500" : ""}`}
                placeholder="Re-enter new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirm && (
              <p className="mt-1 text-xs text-red-400">{errors.confirm.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="h-12 w-full rounded-lg mt-8 text-base flex items-center justify-center gap-x-2.5 font-semibold text-[#0F172A] disabled:opacity-60"
          >
            Set new password {isPending && <SmallSpinner/>}
          </Button>
        </form>
      </section>

      <p className="mt-8 text-center text-sm text-[#94A3B8]">
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
    </>
  )
}