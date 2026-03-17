"use client"

import Link from "next/link"
import { Lock, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import AuthStepHeader from "@/components/auth/auth-step-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForgetPassword } from "../apis/password/forgetpassword"
import { formatAxiosErrorMessage } from "@/utils"
import { AxiosError } from "axios"
import { useErrorModalState } from "@/hooks"
import { ErrorModal } from "@/components/ui/ErrorModal"
import { SmallSpinner } from "@/components/ui/Spinner"

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
})

export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const {
        isErrorModalOpen,
        setErrorModalState,
        openErrorModalWithMessage,
        errorModalMessage,
      } = useErrorModalState();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  })

  const {mutate:handleForget, isPending}=useForgetPassword()

  function onSubmit(data: ForgotPasswordData) {
    // console.log(data)
    handleForget(data,{
      onSuccess: (data) => {
        // console.log(data);
        router.push(`/forgot-password/check-email?email=${data?.data?.email}`)
      },
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 onError: (error:any) => {
                   const errorMessage = 
    error?.response?.data?.data?.non_field_errors?.[0]
    || error?.response?.data?.message
    || formatAxiosErrorMessage(error as AxiosError)
    || 'An error occurred. Please try again.';
  openErrorModalWithMessage(String(errorMessage));
                 },
               })
               console.log('Form submitted:', data)
               // setCompanyInfoData(data)
               // Handle form submission
             }
  



  return (
    <>
    <div className="max-2xl:px-6">

      <AuthStepHeader backHref="/signin" backLabel="Back to login" showProgress={false} />
    </div>

      <section className="rounded-2xl border border-border bg-white p-6 sm:p-8">
        <div className="grid h-14 w-14 place-items-center rounded-full border border-primary/35 bg-primary/5 text-primary">
          <Lock className="h-5 w-5" />
        </div>

        <h1 className="mt-5 text-4xl font-semibold text-[#0F172A]">Forget your password?</h1>
        <p className="mt-2 text-sm text-[#64748B]">No worries, we&apos;ll send you a reset link.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#0F172A]">Your email address</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <Input
                {...register("email")}
                type="email"
                className={`h-11 bg-[#F8FAFC] pl-9 ${errors.email ? "border-red-500" : ""}`}
                placeholder="Email"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="h-12 w-full rounded-lg text-base flex items-center justify-center gap-x-2 font-semibold text-[#0F172A] disabled:opacity-60"
          >
            Send reset link {isPending && <SmallSpinner/>}
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