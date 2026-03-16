import { BarChart3, BookOpen, Brain, Target, Sparkles } from "lucide-react"
import MotionReveal from "@/components/shared/motion-reveal"

type Feature = {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

const FEATURES: Feature[] = [
  {
    title: "AI-Powered Question Generation",
    description:
      "Upload your study materials and watch our advanced AI instantly generate relevant, exam-style questions tailored to your content.",
    icon: Brain,
  },
  {
    title: "Massive Question Bank",
    description:
      "Access over 50,000 carefully curated questions spanning international, professional, and local examinations.",
    icon: BookOpen,
  },
  {
    title: "Smart Analytics Dashboard",
    description:
      "Track every aspect of your progress with detailed insights, performance trends, and AI-powered recommendations.",
    icon: BarChart3,
  },
  {
    title: "Adaptive Learning Engine",
    description:
      "Experience dynamic difficulty adjustment that learns from your performance to maximize learning efficiency.",
    icon: Target,
  },
]

export default function FeaturesGrid() {
  return (
    <section id="features" className="bg-white font-inter">
      <div className="mx-auto max-w-375 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <MotionReveal className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-2 text-xs font-semibold text-muted-foreground">
            <Sparkles className="h-4 w-4" strokeWidth={1.5} />
            Powerful Features
          </div>

          <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-[#292D32] sm:text-4xl lg:text-5xl">
            Everything You Need to Succeed
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
            Comprehensive tools powered by cutting-edge AI technology designed to help you master
            any exam
          </p>
        </MotionReveal>

        <div className="mx-auto mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-14">
          {FEATURES.map((f, idx) => {
            const Icon = f.icon
            return (
              <MotionReveal
                key={f.title}
                delay={idx * 0.06}
                y={14}
                className="group rounded-2xl border border-[#E2E8F0] bg-white p-8 transition-shadow hover:shadow-md"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#F1F5F9] ring-1 ring-border">
                  <Icon className="h-5 w-5 text-[#314158]" strokeWidth={1.5} />
                </div>

                <h3 className="mt-5 text-base font-semibold text-[#292D32] sm:text-lg">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm md:text-base leading-relaxed max-w-xl text-[#45556C]">
                  {f.description}
                </p>
              </MotionReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}