import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Clock, Shield, Upload, Zap, Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import MotionReveal from "@/components/shared/motion-reveal"

export default function Hero() {
  return (
    <section className="hero-bg relative isolate overflow-clip bg-background">
     

      <div className="font-inter mx-auto max-w-7xl px-4 pb-0 pt-14 sm:px-6 sm:pb-0 sm:pt-12 lg:px-8 lg:pb-0 lg:pt-20">
        <div className="mx-auto max-w-4xl text-center">
          <MotionReveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/60 bg-accent/20 px-4 py-2 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur">
              <Zap className="h-4 w-4 text-primary" />
              AI-Powered Exam Preparation Platform
            </div>
          </MotionReveal>

          <MotionReveal delay={0.05}>
            <h2 className="font-jarkata mt-8 text-4xl leading-[1.08] tracking-tighter text-[#292D32] sm:text-5xl lg:text-[60px]">
              Ace any exams with{" "}
              <span className="underline text-primary">
                AI-powered
              </span>{" "}
              learning and practice
            </h2>
          </MotionReveal>

          <MotionReveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              From WAEC to SAT, professional certifications to school exams. Upload your study
              materials and get instant AI-generated practice questions.
            </p>
          </MotionReveal>

          <MotionReveal delay={0.15}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Button asChild className="h-11 rounded-[14px] px-6 font-semibold text-foreground btn-glow">
                <Link href="/get-started">
                  Start Practicing Free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-11 rounded-[14px] bg-white/70 px-6 font-semibold"
              >
                <Link href="/upload">
                  <Upload className="h-4 w-4" />
                  Upload Materials
                </Link>
              </Button>
            </div>
          </MotionReveal>

          <MotionReveal delay={0.2}>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-[#45556C] sm:text-sm">
              <div className="inline-flex items-center gap-2">
                <Shield className="h-4 w-4" strokeWidth={1} />
                Bank-grade security
              </div>
              <div className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4" strokeWidth={1} />
                24/7 access
              </div>
              <div className="inline-flex items-center gap-2">
                <Zap className="h-4 w-4" strokeWidth={1} />
                Instant results
              </div>
              <div className="inline-flex items-center gap-2">
                <Globe className="h-4 w-4" strokeWidth={1} />
                Multi-device sync
              </div>
            </div>
          </MotionReveal>
        </div>

        {/* Hero image */}
        <MotionReveal delay={0.25} y={20} className="mx-auto mt-14 max-w-4xl translate-y-10 sm:mt-12 sm:translate-y-16 lg:mt-20 lg:translate-y-10">
            <Image
              src="/assets/hero-mask.svg"
              alt="PrepMaster dashboard preview"
              width={600}
              height={600}
              priority
              className="h-auto w-full object-contain"
            />
        </MotionReveal>
      </div>
    </section>
  )
}