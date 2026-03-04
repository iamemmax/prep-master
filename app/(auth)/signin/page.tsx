"use client"

import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthStepHeader from "@/components/auth/auth-step-header"

export default function SigninPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const canSubmit = useMemo(() => /\S+@\S+\.\S+/.test(email) && password.length >= 8, [email, password])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    router.push("/")
  }

  return (
    <div className="bg-white">
      <AuthStepHeader backHref="/" backLabel="Back to home" showProgress={false} />

      <section className="rounded-2xl border border-border p-6 sm:p-8 mt-5">
        <h1 className="text-[24px] font-semibold text-[#0F172B]">Welcome back.</h1>
        <p className="mt-1 text-sm text-[#64748B]">Your progress is waiting. Let&apos;s pick up where you left off.</p>

        <form className="space-y-6 mt-8" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#0F172A]">Email</label>
            <div className="relative">
              <Image src="/assets/svg/mail.svg" alt="Mail" width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-[#F8FAFC] px-9 placeholder:text-xs "
                placeholder="Email"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#0F172A]">Password</label>
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-[#F8FAFC] px-9 placeholder:text-xs "
                placeholder="Password"
              />
            </div>
          </div>

          <Button type="submit" disabled={!canSubmit} className="mt-2 h-12 w-full rounded-lg text-base font-semibold text-[#0F172A] disabled:opacity-60">
            Sign In
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-[#94A3B8]">
          Forgot password ?{" "}
          <Link href="/forgot-password" className="font-medium text-primary">
            Reset link
          </Link>
        </p>

        <p className="mt-8 text-center text-sm text-[#94A3B8]">
          Don&apos;t have an account ?{" "}
          <Link href="/signup" className="font-medium text-primary">
            Register
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
