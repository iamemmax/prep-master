import { cn } from "@/lib/utils"
import MotionReveal from "@/components/shared/motion-reveal"
import { ArrowRight, Brain, CheckCircle2, Target, Upload } from "lucide-react"

type Step = {
  step: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

const STEPS: Step[] = [
  {
    step: "1",
    title: "Choose or Upload",
    description: "Select from 100+ exam types or upload your own study materials in any format",
    icon: Upload,
  },
  {
    step: "2",
    title: "AI Analysis",
    description:
      "Our AI instantly analyzes content and generates relevant practice questions",
    icon: Brain,
  },
  {
    step: "3",
    title: "Smart Practice",
    description:
      "Take adaptive tests with instant feedback and detailed explanations",
    icon: Target,
  },
  {
    step: "4",
    title: "Track & Excel",
    description:
      "Monitor your progress and ace your exams with confidence",
    icon: CheckCircle2,
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#F8FAFC] font-inter">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <MotionReveal className="mx-auto max-w-5xl text-center">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-[#101828] sm:text-[48px]">
            Your Path to Success
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-[#667085] sm:text-base">
            Four simple steps from practice to mastery
          </p>
        </MotionReveal>

        <div className="mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, idx) => {
            const Icon = s.icon
            return (
              <MotionReveal key={s.step} delay={idx * 0.05} className="relative">
                {idx < STEPS.length - 1 ? (
                  <ArrowRight className="absolute -right-4 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-primary/60 lg:block" />
                ) : null}

                <div
                  className={cn(
                    "h-full rounded-2xl border border-[#D9E2EC] bg-white px-7 pb-7 pt-7",
                    "transition-colors hover:border-[#CCD8E5]"
                  )}
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#E9950A] text-white shadow-[0_8px_16px_rgba(233,149,10,0.35)]">
                    <span className="text-2xl leading-none font-bold">{s.step}</span>
                  </div>

                  <div className="mt-5 grid h-12 w-12 place-items-center rounded-2xl border border-[#E5E7DA] bg-[#F1F0E6] text-[#E9950A]">
                    <Icon className="h-5 w-5" strokeWidth={1.7} />
                  </div>

                  <div className="mt-6 text-[20px] leading-none font-semibold tracking-tight text-[#292D32]">
                    {s.title}
                  </div>
                  <div className="mt-3  text-[14px] leading-[1.55] text-[#45556C]">
                    {s.description}
                  </div>
                </div>
              </MotionReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}