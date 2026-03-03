import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import MotionReveal from "@/components/shared/motion-reveal"
import { Check, Sparkles } from "lucide-react"

type Plan = {
  name: string
  price: string
  period: string
  tagline?: string
  highlight?: boolean
  features: string[]
  cta: { label: string; href: string; variant?: "default" | "outline" }
}

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "₦0",
    period: "forever",
    features: [
      "50 questions per week",
      "Basic exam categories",
      "Standard practice mode",
      "Basic performance tracking",
      "AI question generation (limited)",
      "Progress tracking",
    ],
    cta: { label: "Get started free", href: "/signup", variant: "outline" },
  },
  {
    name: "Premium",
    price: "₦2,500",
    period: "per month",
    tagline: "Most popular",
    highlight: true,
    features: [
      "Unlimited questions + AI exams",
      "All exam categories",
      "Deep analytics dashboard",
      "Personalized practice plan",
      "Priority support",
      "Offline access",
    ],
    cta: { label: "Start Premium", href: "/pricing", variant: "default" },
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="bg-white font-inter">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <MotionReveal className="mx-auto max-w-5xl text-center">
          <Badge variant="secondary" className="bg-[#F1F5F9] py-2.5 px-4.5 text-foreground">
            Simple Pricing
          </Badge>
          <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-[#101828] sm:text-[48px]">
            Start free. Upgrade when you're ready.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-[#667085] sm:mt-4 sm:text-base">
            No lock-ins · Cancel anytime
          </p>
        </MotionReveal>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 lg:mt-14 lg:grid-cols-2">
          {PLANS.map((p, idx) => (
            <MotionReveal
              key={p.name}
              delay={idx * 0.08}
              className={[
                "relative rounded-2xl border p-6 shadow-sm",
                p.highlight
                  ? "border-[#0F172A] bg-[#0F172A] text-white shadow-[0_30px_90px_rgba(15,23,42,0.25)]"
                  : "border-border bg-white text-[#292D32]",
              ].join(" ")}
            >
              {p.tagline ? (
                <div className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-[#0F172A]">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {p.tagline}
                </div>
              ) : null}

              <div className="text-sm font-semibold">{p.name}</div>
              <div className="mt-2 flex items-center gap-2">
                <div className="text-[42px] font-semibold font-jarkata tracking-[-0.02em]">{p.price}</div>
                <div className={["mt-2 text-xs", p.highlight ? "text-[#A6ABC7]" : "text-[#667085]" ].join(" ")}>
                  {p.period}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <div key={f} className="flex items-start gap-3 text-sm">
                    <div
                      className={[
                        "mt-0.5 grid h-5 w-5 place-items-center rounded-full",
                        p.highlight ? "bg-white/10" : "bg-accent/10",
                      ].join(" ")}
                    >
                      <Check
                        className={p.highlight ? "h-3.5 w-3.5 text-primary" : "h-3.5 w-3.5 text-accent"}
                        strokeWidth={2}
                      />
                    </div>
                    <div className={p.highlight ? "text-white/85" : "text-[#45556C]"}>
                      {f}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Button
                  asChild
                  variant={p.cta.variant === "outline" ? "outline" : "default"}
                  className={[
                    "h-11 w-full rounded-[14px] px-6 font-semibold",
                    p.highlight
                      ? "bg-primary text-[#0F172A] hover:bg-primary/90 border-transparent"
                      : "border-border",
                  ].join(" ")}
                >
                  <Link href={p.cta.href}>{p.cta.label}</Link>
                </Button>
              </div>
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>
  )
}