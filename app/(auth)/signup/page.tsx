"use client"

import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthStepHeader from "@/components/auth/auth-step-header"
import z from "zod"
import { userOnboardingInfoSchema } from "../schema/signup/userInfoSchema"
import { useOnboardUser } from "../apis/signup/onboardUser"
import { useErrorModalState } from "@/hooks"
import { AxiosError } from "axios"
import { formatAxiosErrorMessage } from "@/utils"
import { Spinner } from "@/components/ui/Spinner"
import { ErrorModal } from "@/components/ui/ErrorModal"
import { useOnboardingStore } from "@/app/store/onboardingStore"



export type userOnboardingInfoTypes = z.infer<typeof userOnboardingInfoSchema>
export default function SignupPage() {
   const {
      isErrorModalOpen,
      setErrorModalState,
      openErrorModalWithMessage,
      errorModalMessage,
    } = useErrorModalState();
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const { userInfo, setUserInfo } = useOnboardingStore()

  const {
    register,
    handleSubmit,

    formState: { errors },
  } = useForm<userOnboardingInfoTypes>({
    resolver: zodResolver(userOnboardingInfoSchema),
    defaultValues: {
      email: userInfo?.email ?? "",
      first_name: userInfo?.first_name ?? "",
      last_name: userInfo?.last_name ?? "",
      password: userInfo?.password ?? "",
    },
    mode: "onChange"
  })

  const {mutate:handleOnboardUser,isPending} = useOnboardUser()

  function onSubmit(data: userOnboardingInfoTypes) {
    setUserInfo(data)
    handleOnboardUser(data,{
      onSuccess:()=>{

        router.push(`/signup/verify?email=${data?.email}`)
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError:(error:any)=>{
         const errorMessage = error?.response?.data?.errors?.message
                    || error?.response?.data?.message
                    || formatAxiosErrorMessage(error as AxiosError)
                    || 'An error occurred. Please try again.';
                openErrorModalWithMessage(String(errorMessage));
              openErrorModalWithMessage(String(errorMessage));
      }
    })
      
      // if (!canContinue) return
    
  }
  return (
    <div className="bg-white px-5">
      <AuthStepHeader backHref="/" backLabel="Back to home" stepLabel="Step 1 of 3 · Personal details" progress={1} />

      <section className="rounded-2xl border border-border bg-white p-6 sm:p-8 2xl:p-10 mt-10">
        <h1 className="text-[24px] font-inter font-semibold text-[#0F172B]">Create a free account</h1>
        <p className="ml-1 font-inter text-sm text-[#64748B]">We just need a few details to get you started</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium text-[#0F172A]">First Name</label>
              <div className="relative">
                <Image src="/assets/svg/user-left.svg" alt="User" width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                <Input
                  {...register("first_name")}
                  // onChange={(e) => updateField("firstName", e.target.value)}
                  className={`w-full px-4 sm:py-3 py-2 max-sm:h-11 border outline-none rounded-lg pl-9 font-sans text-sm focus:outline-none focus:ring-0  focus:ring-transparent transition-all ${errors.first_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="First name"
                />
              </div>
              {errors.first_name && (
                <p className="text-red-500 text-xs mt-1 font-sans">{errors.first_name.message}</p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-[#0F172A]">Last Name</label>
              <div className="relative">
                <Image src="/assets/svg/user-right.svg" alt="User" width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                <Input
                  {...register("last_name")}
                  className={`w-full px-4 sm:py-3 py-2 max-sm:h-11 border outline-none rounded-lg pl-9 font-sans text-sm focus:outline-none focus:ring-0  focus:ring-transparent transition-all ${errors.last_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Last name"
                />
              </div>
              {errors.last_name && (
                <p className="text-red-500 text-xs mt-1 font-sans">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-[#0F172A]">Email</label>
            <div className="relative">
              <Image src="/assets/svg/mail.svg" alt="Mail" width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <Input
                {...register("email")}
                className={`w-full px-4 sm:py-3 py-2 max-sm:h-11 border outline-none rounded-lg pl-9 font-sans text-sm focus:outline-none focus:ring-0  focus:ring-transparent transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Email"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 font-sans">{errors.email.message}</p>
            )}
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
                {...register("password")}
                // value={form.password}
                // onChange={(e) => updateField("password", e.target.value)}
                className={`w-full px-4 sm:py-3 py-2 max-sm:h-11 border outline-none rounded-lg pl-9 font-sans text-sm focus:outline-none focus:ring-0  focus:ring-transparent transition-all ${errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Password"
              />
            </div>
            <p className="mt-1 text-xs text-[#94A3B8]">Minimum length is 8 characters.</p>

            {errors.password && (
              <p className="text-red-500 text-xs mt-1 font-sans">{errors.password.message}</p>
            )}
          </div>

          <Button disabled={isPending} type="submit" className=" h-12 mt-6 w-full flex items-center justify-center gap-3 rounded-lg text-sm font-semibold text-white disabled:opacity-60">
            Sign Up {isPending && <Spinner/>}
          </Button>
        </form>

        <p className="mt-5 text-xs md:text-sm leading-relaxed text-[#94A3B8]">
          By creating an account, you agree to the{" "}
          <Link href="/terms" className="underline underline-offset-2">
            Terms of Service
          </Link>
          . We&apos;ll occasionally send you account-related emails.
        </p>

        <p className="mt-12 text-center text-sm text-[#94A3B8]">
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


       <ErrorModal
            isErrorModalOpen={isErrorModalOpen}
            setErrorModalState={() => setErrorModalState(false)}
            subheading={errorModalMessage || "Please check your inputs and try again."}
          />
    </div>
  )
}
