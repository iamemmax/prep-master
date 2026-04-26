// Hero.tsx
"use client"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Upload, Zap, Shield, Clock, Globe, LayoutGrid, TrendingUp, Users, MessageSquareText } from "lucide-react"
import { Button } from "@/components/ui/button"
import MotionReveal from "@/components/shared/motion-reveal"
import { useAuth } from "@/context/authentication"

const TRUST_BADGES = [
  { icon: Shield, label: "Bank-grade security" },
  { icon: Clock, label: "24/7 access" },
  { icon: Zap, label: "Instant results" },
  { icon: Globe, label: "Multi-device sync" },
]


type Stat = {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}

const STATS: Stat[] = [
  { value: "50,000+", label: "Practice Questions", icon: MessageSquareText },
  { value: "100+", label: "Exam Categories", icon: LayoutGrid },
  { value: "25,000+", label: "Active Students", icon: Users },
  { value: "86%", label: "Avg Pass Rate", icon: TrendingUp },
]

// page.tsx or wherever you compose them
export default function Hero() {
  const {authState:{isAuthenticated}}= useAuth()
  return (
    <>
      <section className="relative isolate overflow-clip bg-[#f4f5f7]">
        {/* Grid background */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, #d1d5db 1px, transparent 1px),
              linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
            `,
            backgroundSize: "52px 52px",
            maskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 50%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 50%, transparent 100%)",
            opacity: 0.45,
          }}
        />

        {/* ── Hero content ── */}
        <div className="relative z-10 font-inter mx-auto max-w-375 px-3 pb-0 pt-5 sm:px-6  lg:px-8 lg:pt-16">
          <div className="mx-auto max-w-4xl text-center">

            <MotionReveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-xs font-semibold text-amber-700 shadow-sm">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                AI-Powered Exam Preparation Platform
              </div>
            </MotionReveal>

            <MotionReveal delay={0.08}>
              <h1 className="mt-7 font-bold  sm:leading-[1.15] tracking-tight text-[#1a1f2e] text-[23px] sm:text-[42px] lg:text-[56px]">
                Ace any exams with{" "}
                <strong className="text-primary underline decoration-[3px] underline-offset-[6px]">
                  AI-powered
                </strong>
                <br />
                learning and practice
              </h1>
            </MotionReveal>

            <MotionReveal delay={0.14}>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-[#64748b] sm:text-lg">
                From WAEC to SAT, professional certifications to school exams. Upload your study
                materials and get instant AI-generated practice questions.
              </p>
            </MotionReveal>

        <MotionReveal delay={0.2}>
  <div className="mt-8 flex items-center max-sm:px-3 justify-center gap-2 sm:gap-4">
    
    <Button
      asChild
      size={"lg"}
      className="h-12 sm:px-6! px-5! rounded-full font-semibold max-sm:text-xs text-[#1a1f2e] btn-glow shadow-md flex items-center gap-2"
    >
      <Link href={isAuthenticated?"/dashboard":"/signin"}>
        Start Practicing Free
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>

    <Button
      asChild
      variant="outline"
      className="h-12 sm:px-6! px-5! rounded-full bg-white border-[#CAD5E2] max-sm:text-xs font-semibold text-[#1a1f2e] flex items-center gap-2"
    >
    <Link href={isAuthenticated?"/dashboard":"/signin"}>
        <Upload className="h-4 w-4" />
        Upload Materials
      </Link>
    </Button>

  </div>
</MotionReveal>

            <MotionReveal delay={0.26}>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                {TRUST_BADGES.map(({ icon: Icon, label }) => (
                  <span key={label} className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </span>
                ))}
              </div>
            </MotionReveal>
          </div>

<MotionReveal delay={0.32} y={24} className="mx-auto mt-5 grid grid-cols-2 max-w-6xl gap-4">
  <div className="w-full overflow-hidden rounded-2xl">
    <Image
      src="/assets/cards/cardImage1.png"
      alt="PrepMaster dashboard preview 1"
      width={0}
      height={0}
      sizes="(max-width: 768px) 100vw, 50vw"
      className="w-full h-auto"
    />
  </div>
  <div className="w-full overflow-hidden rounded-2xl">
    <Image
      src="/assets/cards/cardImage2.png"
      alt="PrepMaster dashboard preview 2"
      width={0}
      height={0}
      sizes="(max-width: 768px) 100vw, 50vw"
      className="w-full h-auto"
    />
  </div>
</MotionReveal>
        </div>

        {/* ── Stats Strip — flush inside same section, no gap ── */}
        <div className="relative z-10 bg-[#292D32] -mt-10">
          <div className="mx-auto max-w-375  ">
            <div className="flex sm:justify-between items-center flex-wrap gap-3 ">
              {STATS.map((s, idx) => {
                const Icon = s.icon
                return (
                  <MotionReveal
                    key={s.label}
                    delay={idx * 0.06}
                    y={10}
                    className="flex items-center  gap-3.5 px-4 sm:px-6 py-7"
                  >
                    <div className="grid h-8 w-8 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
                      <Icon className="sm:h-5 h-4 sm:w-5 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="sm:text-2xl  text-xlfont-bold tracking-tight text-white sm:text-[32px]">
                        {s.value}
                      </div>
                      <div className="mt-0.5 text-[11px] font-medium text-[#90A1B9] sm:text-xs">
                        {s.label}
                      </div>
                    </div>
                  </MotionReveal>
                )
              })}
            </div>
          </div>
        </div>

      </section>
    </>
  )
}