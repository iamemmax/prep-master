"use client"

import Link from "next/link"
import { Lock, Mail } from "lucide-react"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import AuthStepHeader from "@/components/auth/auth-step-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const canSubmit = useMemo(() => /\S+@\S+\.\S+/.test(email), [email])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    router.push("/forgot-password/check-email")
  }

  return (
    <>
      <AuthStepHeader backHref="/signin" backLabel="Back to login" showProgress={false} />

      <section className="rounded-2xl border border-border bg-white p-6 sm:p-8">
        <div className="grid h-14 w-14 place-items-center rounded-full border border-primary/35 bg-primary/5 text-primary">
          <Lock className="h-5 w-5" />
        </div>

        <h1 className="mt-5 text-4xl font-semibold text-[#0F172A]">Forget your password ?</h1>
        <p className="mt-2 text-sm text-[#64748B]">No worries, we&apos;ll send you a reset link.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#0F172A]">Your email address</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-[#F8FAFC] pl-9"
                placeholder="Email"
              />
            </div>
          </div>

          <Button type="submit" disabled={!canSubmit} className="h-12 w-full rounded-lg text-base font-semibold text-[#0F172A] disabled:opacity-60">
            Send reset link
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
