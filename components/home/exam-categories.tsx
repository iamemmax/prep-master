import Link from "next/link"
import {
  ArrowRight,
  Globe,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import MotionReveal from "@/components/shared/motion-reveal"

type Category = {
  title: string
  subtitle: string
  questions: string
  icon: string
}

const CATEGORIES: Category[] = [
  {
    title: "International Exams",
    subtitle: "SAT, GRE, GMAT, TOEFL",
    questions: "15,000+",
    icon: "🌍",
  },
  {
    title: "Professional Certifications",
    subtitle: "CPA, PMP, CISSP, AWS",
    questions: "12,000+",
    icon: "💼",
  },
  {
    title: "West African Exams",
    subtitle: "WAEC, JAMB, NECO",
    questions: "8,000+",
    icon: "📚",
  },
  {
    title: "Science & Medicine",
    subtitle: "MCAT, USMLE, Biology",
    questions: "10,000+",
    icon: "🔬",
  },
  {
    title: "School Exams",
    subtitle: "O-Level, A-Level, GCSE",
    questions: "7,000+",
    icon: "🎓",
  },
  {
    title: "Custom Materials",
    subtitle: "Upload your own content",
    questions: "Unlimited",
    icon: "✨",
  },
]

export default function ExamCategories() {
  return (
    <section id="exams" className="bg-[#FAFAFA] font-inter">
      <div className="mx-auto max-w-375 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <MotionReveal className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-[#F1F5F9] px-4 py-2 text-xs font-semibold text-muted-foreground">
            <Globe className="h-4 w-4 text-[#62748E]" strokeWidth={1.5} />
            Comprehensive Coverage
          </div>

          <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-[#292D32] sm:text-[48px]">
            Practice for Any Exam
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-[#667085] sm:mt-4 sm:text-base">
            From local to international, academic to professional — we&apos;ve got comprehensive coverage
          </p>
        </MotionReveal>

        <div className="mx-auto mt-12 grid max-w-375 grid-cols-1 gap-6 md:grid-cols-3 lg:mt-14">
          {CATEGORIES.map((c, idx) => {
            return (
              <MotionReveal
                key={c.title}
                delay={idx * 0.05}
                className="rounded-2xl border border-border bg-white px-6 py-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="text-[48px] ">
                    {c.icon}
                  </div>
                </div>

                <div className="mt-4 text-lg font-bold text-[#292D32] tracking-tight leading-none">{c.title}</div>
                <div className="mt-1 text-[12px] text-[#45556C] leading-none">{c.subtitle}</div>

                <div className="mt-8 pt-4 flex items-center justify-between border-t border-border text-xs text-muted-foreground">
                  <span className="text-[#62748E] text-[12px]">Questions</span>
                  <span className="font-semibold text-[#292D32]">{c.questions}</span>
                </div>
              </MotionReveal>
            )
          })}
        </div>

        <MotionReveal delay={0.2} className="mt-10 flex justify-center">
          <Button
            asChild
            variant="default"
            className=" rounded-[14px] border border-accent/80 bg-accent/10 px-6 py-5 font-medium text-accent hover:bg-accent/20"
          >
            <Link href="/exams">
              Browse All Exam Categories <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </MotionReveal>
      </div>
    </section>
  )
}