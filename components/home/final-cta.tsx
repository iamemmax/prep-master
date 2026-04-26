"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import MotionReveal from "@/components/shared/motion-reveal"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { useAuth } from "@/context/authentication"

export default function FinalCta() {
  const { authState: { isAuthenticated } } = useAuth()
  const ctaHref = isAuthenticated ? "/dashboard" : "/signin"

  return (
    <section className="relative isolate overflow-hidden font-inter h-[427px] final-cta-bg">
     

      <div className="mx-auto max-w-6xl h-full flex flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <MotionReveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-2xl font-semibold font-jarkata tracking-[-0.02em] text-white sm:text-[36px]">
            Ready to start your success story?
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-pretty text-sm font-inter leading-tight font-light text-white/65 sm:text-xl">
            Join PrepMaster today and access unlimited practice questions, AI-powered features, and
            advanced analytics.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button
              asChild
              className="h-11 min-w-[150px] rounded-full px-6 font-normal text-[#314158] btn-glow hover:bg-primary/90"
            >
              <Link href={ctaHref}>
                Start for free <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-11 min-w-[150px] rounded-full border-white/20 bg-white px-6 font-normal text-[#314158] hover:bg-white/80"
            >
              <Link href="/#pricing">See pricing</Link>
            </Button>
          </div>
        </MotionReveal>
      </div>
    </section>
  )
}