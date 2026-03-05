"use client"

import Link from "next/link"
import { CheckCircle2, Circle, Eye, EyeOff, Lock } from "lucide-react"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import AuthStepHeader from "@/components/auth/auth-step-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")

  const rules = useMemo(
    () => ({
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      numberOrSymbol: /[0-9\W]/.test(password),
    }),
    [password]
  )

  const canSubmit =
    rules.minLength && rules.uppercase && rules.numberOrSymbol && confirm.length > 0 && password === confirm

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    router.push("/forgot-password/success")
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

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#0F172A]">New password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-[#F8FAFC] pr-12"
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8]"
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

          <div>
            <label className="mb-2 block text-sm font-medium text-[#0F172A]">Confirm new password</label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="h-11 bg-[#F8FAFC] pr-12"
                placeholder="Re-enter new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8]"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirm.length > 0 && password !== confirm ? (
              <p className="mt-1 text-xs text-destructive">Passwords do not match.</p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={!canSubmit}
            className="h-12 w-full rounded-lg text-base font-semibold text-[#0F172A] disabled:opacity-60"
          >
            Set new password
          </Button>
        </form>
      </section>

      <p className="mt-8 text-center text-sm text-[#94A3B8]">
        Having an issues,{" "}
        <Link href="/support" className="font-medium text-primary underline underline-offset-2">
          speak with support
        </Link>
      </p>
    </>
  )
}
