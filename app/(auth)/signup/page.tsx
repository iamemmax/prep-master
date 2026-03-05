"use client"

import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthStepHeader from "@/components/auth/auth-step-header"

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  })

  const canContinue = useMemo(() => {
    const emailOk = /\S+@\S+\.\S+/.test(form.email)
    return (
      form.firstName.trim().length > 1 &&
      form.lastName.trim().length > 1 &&
      emailOk &&
      form.password.length >= 8
    )
  }, [form])

  function updateField<K extends keyof typeof form>(field: K, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canContinue) return
    router.push("/signup/verify")
  }

  return (
    <div className="bg-white">
      <AuthStepHeader backHref="/" backLabel="Back to home" stepLabel="Step 1 of 3 · Personal details" progress={1} />

      <section className="rounded-2xl border border-border bg-white p-6 sm:p-8">
        <h1 className="text-[24px] font-semibold text-[#0F172B]">Create a free account</h1>
        <p className="ml-1 text-sm text-[#64748B]">We just need a few details to get you started</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium text-[#0F172A]">First Name</label>
              <div className="relative">
                <Image src="/assets/svg/user-left.svg" alt="User" width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                <Input
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  className="h-11 bg-[#F8FAFC] pl-9 placeholder:text-xs "
                  placeholder="First Name"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-[#0F172A]">Last Name</label>
              <div className="relative">
                <Image src="/assets/svg/user-right.svg" alt="User" width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                <Input
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  className="h-11 bg-[#F8FAFC] pl-9 placeholder:text-xs "
                  placeholder="Last Name"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-[#0F172A]">Email</label>
            <div className="relative">
              <Image src="/assets/svg/mail.svg" alt="Mail" width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <Input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="h-11 bg-[#F8FAFC] pl-9 placeholder:text-xs "
                placeholder="Email"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-[#0F172A]">Password</label>
            <div className="relative">
              <Image src="/assets/svg/lock.svg" alt="Lock" width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <Input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                className="h-11 bg-[#F8FAFC] px-9 placeholder:text-xs "
                placeholder="Password"
              />
            </div>
            <p className="mt-1 text-xs text-[#94A3B8]">Minimum length is 8 characters.</p>
          </div>

          <Button type="submit" disabled={!canContinue} className="mt-2 h-11 w-full rounded-lg text-sm font-semibold text-white disabled:opacity-60">
            Sign Up
          </Button>
        </form>

        <p className="mt-5 text-xs leading-relaxed text-[#94A3B8]">
          By creating an account, you agree to the{" "}
          <Link href="/terms" className="underline underline-offset-2">
            Terms of Service
          </Link>
          . We&apos;ll occasionally send you account-related emails.
        </p>

        <p className="mt-8 text-center text-sm text-[#94A3B8]">
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-primary">
            Login
          </Link>
        </p>
      </section>

      <p className="mt-8 text-center text-sm text-[#94A3B8]">
        Having an issues,{" "}
        <Link href="/support" className="font-medium text-primary underline underline-offset-2">
          speak with support
        </Link>
      </p>
    </div>
  )
}
