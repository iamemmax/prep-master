"use client"

import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthStepHeader from "@/components/auth/auth-step-header"
import { useErrorModalState } from "@/hooks"
import { ErrorModal } from "@/components/ui/ErrorModal"
import { useLogin } from "../apis/login/login"
import { formatAxiosErrorMessage } from "@/utils"
import { AxiosError } from "axios"
import { SmallSpinner } from "@/components/ui/Spinner"

const signinSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  user_type: z.enum(["PREP_MASTER"]).optional()
})

export type LoginData = z.infer<typeof signinSchema>

export default function SigninPage() {
  const {
    isErrorModalOpen,
    setErrorModalState,
    openErrorModalWithMessage,
    errorModalMessage,
  } = useErrorModalState();
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(signinSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" , user_type:"PREP_MASTER"},
  })

  const { mutate: handleLogin, isPending } = useLogin()

  const onSubmit = (data: LoginData) => {
    handleLogin(data, {
      onSuccess: () => {
       router.replace("/dashboard")

       
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
     onError: (error: any) => {
  const errorMessage = 
    error?.response?.data?.data?.non_field_errors?.[0]
    || error?.response?.data?.message
    || formatAxiosErrorMessage(error as AxiosError)
    || 'An error occurred. Please try again.';
  openErrorModalWithMessage(String(errorMessage));
}
    })
  }

  return (
 <div className="bg-white h-[90vh] max-md:p-5 flex flex-col">
  <AuthStepHeader backHref="/" backLabel="Back to home" showProgress={false} />

  <div className="flex flex-col flex-1">
    <div className=" flex mt-10 md:mt-18.75 justify-center">
      <section className="rounded-2xl border border-border p-4 sm:p-8 w-full">
        
        <h1 className="text-[24px] font-semibold text-[#0F172B]">Welcome back.</h1>
        <p className="mt-1 text-sm text-[#64748B]">Your progress is waiting. Let&apos;s pick up where you left off.</p>

        <form className="space-y-6 mt-8" onSubmit={handleSubmit(onSubmit)}>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#0F172A]">Email</label>
            <div className="relative">
              <Image
                src="/assets/svg/mail.svg"
                alt="Mail"
                width={16}
                height={16}
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              />
              <Input
                {...register("email")}
                type="email"
                className={`h-12 bg-[#F8FAFC] px-9 placeholder:text-xs ${errors.email ? "border-red-500" : ""}`}
                placeholder="Email"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#0F172A]">Password</label>
            <div className="relative">
              <Image
                src="/assets/svg/lock.svg"
                alt="Lock"
                width={16}
                height={16}
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className={`h-12 bg-[#F8FAFC] px-9 placeholder:text-xs ${errors.password ? "border-red-500" : ""}`}
                placeholder="Password"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="mt-2 h-12 w-full flex items-center justify-center gap-x-3 rounded-lg text-base font-semibold text-[#0F172A] disabled:opacity-60"
          >
            Sign In {isPending && <SmallSpinner/>}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-[#94A3B8]">
          Forgot password?{" "}
          <Link href="/forgot-password" className="font-medium text-primary">
            Reset link
          </Link>
        </p>

        <p className="text-center mt-12 md:mt-24.5 text-sm text-[#94A3B8]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-primary">
            Register
          </Link>
        </p>
      </section>

        </div>
     <p className="mt-auto text-center text-sm text-[#94A3B8] pb-4">
  Having an issue?{" "}
  <Link href="/support" className="font-medium text-primary underline underline-offset-2">
    speak with support
  </Link>
</p>

</div>



       <ErrorModal
            isErrorModalOpen={isErrorModalOpen}
            setErrorModalState={() => setErrorModalState(false)}
            subheading={errorModalMessage || "Please check your inputs and try again."}
          />
    </div>
  )
}