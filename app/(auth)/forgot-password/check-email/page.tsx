"use client"
import Link from "next/link"
import { Check, Info } from "lucide-react"

import AuthStepHeader from "@/components/auth/auth-step-header"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"

export default function ForgotPasswordCheckEmailPage() {
  const search = useSearchParams()
  const email = search.get("email")
  return (
    <>
    <div className="max-2xl:px-6">

      <AuthStepHeader backHref="/signin" backLabel="Back to login" showProgress={false} />
    </div>

      <section className="rounded-2xl border border-border bg-white p-6 sm:p-8">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-600/15 text-emerald-600 ring-1 ring-emerald-600/30">
          <Check className="h-5 w-5" strokeWidth={3} />
        </div>

        <h1 className="mt-5 text-4xl font-semibold text-[#0F172A]">Check your email</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
          We sent a reset link to <span className="font-medium text-[#0F172A]">{email??""}</span>,
          check your inbox and follow the link to reset your password.
        </p>

        <div className="mt-5 flex items-center gap-2 rounded-md border border-primary/40 bg-primary/5 px-3 py-2 text-xs text-[#B7791F]">
          <Info className="h-3.5 w-3.5" />
          Link expires in 30 minutes. Check your spam folder if you don&apos;t see it.
        </div>

        <Button asChild className="mt-6 h-12 w-full rounded-lg text-base font-semibold text-[#0F172A]">
          <Link href="/signin">Back to login</Link>
        </Button>

        <p className="mt-5 text-center text-xs text-[#64748B]">
          Didn&apos;t get link ?{" "}
          <Link href="#" className="font-medium text-primary underline underline-offset-2">
            Resend the link
          </Link>
        </p>
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
