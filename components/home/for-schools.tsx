import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import MotionReveal from "@/components/shared/motion-reveal"

const CHIPS = [
  "Custom Exams",
  "Teacher Dashboard",
  "Student Analytics",
  "Bulk Onboarding",
  "API Access",
]

export default function ForSchools() {
  return (
    <section className="bg-[#F2F2F2] font-inter">
      <div className=" px-4 py-10 sm:px-16 lg:px-16">
        <div className=" px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <MotionReveal className="max-w-7xl">
              <Badge
                variant="secondary"
                className="bg-primary/5 text-primary ring-1 ring-primary/80 text-xs  py-1.5 px-5"
              >
                For Schools
              </Badge>

              <h2 className="mt-4 text-balance text-2xl font-semibold font-jarkata tracking-tight text-[#0E1525] sm:text-[46px]">
                Bring PrepMaster to your institution.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Give students and educators a powerful, customizable platform for exam preparation
                and <br/> performance tracking — all from one dashboard.
              </p>
            </MotionReveal>

            <MotionReveal delay={0.1} className="shrink-0">
              <Button
                asChild
                className="h-11 rounded-[14px] px-5 font-semibold text-foreground btn-primary"
              >
                <Link href="/waitlist">Join our waitlist</Link>
              </Button>
            </MotionReveal>
          </div>

          <MotionReveal delay={0.15} className="mt-7 flex flex-wrap gap-2">
            {CHIPS.map((c) => (
              <span
                key={c}
                className="rounded-full border border-accent/80 bg-accent/10 px-4 py-2.5 font-jarkata text-xs font-semibold text-[#202630]"
              >
                {c}
              </span>
            ))}
          </MotionReveal>
        </div>
      </div>
    </section>
  )
}