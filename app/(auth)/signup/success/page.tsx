import Link from "next/link"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function SignupSuccessPage() {
  return (
    <div className="flex min-h-[75vh] px-6 flex-col items-center justify-center">
      <div className="grid h-24 w-24 place-items-center rounded-full bg-emerald-600/15 ring-8 ring-emerald-600/10 animate-pulse">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-600 text-white">
          <Check className="h-9 w-9" strokeWidth={3} />
        </div>
      </div>

      <h1 className="mt-8 text-center text-3xl font-semibold text-[#0F172A]">
        Account created successfully!
      </h1>
      <p className="mt-2 max-w-md text-center text-sm leading-relaxed text-[#94A3B8]">
        Your account has been created, and you&apos;re ready to take your first assessment.
      </p>

      <Button asChild className="mt-8 h-12 w-full max-w-xl rounded-lg text-base font-semibold text-white">
        <Link href="/signin">Continue to Login</Link>
      </Button>

      <p className="mt-16 text-center text-sm text-[#94A3B8]">
        Having an issues,{" "}
        <Link href="/support" className="font-medium text-primary underline underline-offset-2">
          speak with support
        </Link>
      </p>
    </div>
  )
}
