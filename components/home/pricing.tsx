"use client"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import MotionReveal from "@/components/shared/motion-reveal"
import { Check, Sparkles, BookOpen, Brain, Plus, ArrowRight } from "lucide-react"
import { useAuth } from "@/context/authentication"

type Credit = {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  value: string
}

type Plan = {
  name: string
  price: string
  period: string
  tagline?: string
  highlight?: boolean
  description: string
  credits: Credit[]
  features: string[]
  cta: { label: string; href: string }
}


export default function Pricing() {
  const {authState:{isAuthenticated}} = useAuth()
  const PLANS: Plan[] = [
    {
      name: "Free",
      price: "₦0",
      period: "forever",
      description: "Try the essentials, free forever.",
      credits: [
        { icon: BookOpen, label: "Practice questions", value: "50 / week" },
        { icon: Brain, label: "AI credits", value: "10 / week" },
      ],
      features: [
        "Basic exam categories",
        "Standard practice mode",
        "Basic performance tracking",
        "Progress tracking",
      ],
      cta: { label: "Get started free", href: isAuthenticated?"/dashboard":"/signup"},
    },
    {
      name: "Premium",
      price: "₦2,500",
      period: "per month",
      tagline: "Most popular",
      highlight: true,
      description: "Everything you need to ace your exam.",
      credits: [
        { icon: BookOpen, label: "Practice questions", value: "2,000 / mo" },
        { icon: Brain, label: "AI credits", value: "200 / mo" },
      ],
      features: [
        "All exam categories",
        "Deep analytics dashboard",
        "Personalized practice plan",
        "Priority support",
        "Offline access",
      ],
      cta: { label: "Start Premium", href: isAuthenticated?"/dashboard":"/signup" },
    },
  ]
  return (
    <section id="pricing" className="bg-white font-inter">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <MotionReveal className="mx-auto max-w-5xl text-center">
          <Badge variant="secondary" className="bg-[#F1F5F9] py-2.5 px-4.5 text-[#314158]">
            Simple Pricing
          </Badge>
          <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-[#101828] sm:text-[48px]">
            Start free. Upgrade when you&apos;re ready.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-[#667085] sm:mt-4 sm:text-base">
            No lock-ins · Cancel anytime
          </p>
        </MotionReveal>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 lg:mt-14 lg:grid-cols-2">
          {PLANS.map((p, idx) => (
            <MotionReveal
              key={p.name}
              delay={idx * 0.08}
              className={[
                "relative overflow-hidden rounded-3xl border",
                p.highlight
                  ? "border-[#0F172A] bg-gradient-to-br from-[#0F172A] via-[#172033] to-[#0F172A] text-white shadow-[0_30px_90px_-20px_rgba(15,23,42,0.45)]"
                  : "border-border bg-white text-[#292D32] shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)]",
              ].join(" ")}
            >
              {/* Decorative glow on premium */}
              {p.highlight ? (
                <>
                  <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                </>
              ) : null}

              <div className="relative flex h-full flex-col p-7 sm:p-8">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div
                      className={[
                        "text-xs font-semibold uppercase tracking-[0.14em]",
                        p.highlight ? "text-primary" : "text-accent",
                      ].join(" ")}
                    >
                      {p.name}
                    </div>
                    <p
                      className={[
                        "mt-1.5 text-sm",
                        p.highlight ? "text-white/65" : "text-[#667085]",
                      ].join(" ")}
                    >
                      {p.description}
                    </p>
                  </div>
                  {p.tagline ? (
                    <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#ECB22E] px-3 py-1.5 text-[11px] font-semibold text-[#101828]">
                      <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                      {p.tagline}
                    </div>
                  ) : null}
                </div>

                {/* Price */}
                <div className="mt-7 flex items-baseline gap-2">
                  <div className="font-jarkata text-[44px] font-semibold leading-none tracking-[-0.03em] sm:text-[52px]">
                    {p.price}
                  </div>
                  <div
                    className={[
                      "text-sm font-medium",
                      p.highlight ? "text-white/55" : "text-[#667085]",
                    ].join(" ")}
                  >
                    {p.period}
                  </div>
                </div>

                {/* Credits Panel */}
                <div
                  className={[
                    "mt-7 grid grid-cols-2 gap-2 rounded-2xl p-2",
                    p.highlight
                      ? "bg-white/4 ring-1 ring-inset ring-white/6"
                      : "bg-[#F8FAFC] ring-1 ring-inset ring-[#0F172A]/4",
                  ].join(" ")}
                >
                  {p.credits.map((c) => {
                    const Icon = c.icon
                    return (
                      <div
                        key={c.label}
                        className={[
                          "rounded-xl p-4",
                          p.highlight ? "bg-[#0F172A]/40" : "bg-white",
                        ].join(" ")}
                      >
                        <div
                          className={[
                            "inline-flex h-8 w-8 items-center justify-center rounded-lg",
                            p.highlight ? "bg-primary/15 text-primary" : "bg-accent/10 text-accent",
                          ].join(" ")}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2} />
                        </div>
                        <div
                          className={[
                            "mt-3 font-jarkata text-lg font-bold tracking-tight",
                            p.highlight ? "text-white" : "text-[#101828]",
                          ].join(" ")}
                        >
                          {c.value}
                        </div>
                        <div
                          className={[
                            "mt-0.5 text-[11px] leading-tight",
                            p.highlight ? "text-white/55" : "text-[#667085]",
                          ].join(" ")}
                        >
                          {c.label}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Features */}
                <div
                  className={[
                    "mt-7 border-t pt-6",
                    p.highlight ? "border-white/10" : "border-border",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "mb-4 text-[11px] font-semibold uppercase tracking-[0.14em]",
                      p.highlight ? "text-white/50" : "text-[#667085]",
                    ].join(" ")}
                  >
                    What&apos;s included
                  </div>
                  <div className="space-y-3">
                    {p.features.map((f) => (
                      <div key={f} className="flex items-start gap-3 text-sm">
                        <div
                          className={[
                            "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full",
                            p.highlight ? "bg-primary" : "bg-accent/10",
                          ].join(" ")}
                        >
                          <Check
                            className={p.highlight ? `h-3 w-3 ${p?.name==="Premium"?"text-white":"text-[#ECB22E]"}` : "h-3 w-3 text-accent"}
                            strokeWidth={3}
                          />
                        </div>
                        <div className={p.highlight ? "text-white/85" : "text-[#45556C]"}>{f}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-auto pt-8">
                  <Button
                    asChild
                    className={[
                      "group h-12 w-full rounded-[14px] px-6 font-semibold border-transparent",
                      p.highlight
                        ? "bg-[#ECB22E] text-[#101828] hover:bg-[#ECB22E]/90"
                        : "bg-[#0F172A] text-white hover:bg-[#0F172A]/90",
                    ].join(" ")}
                  >
                    <Link href={p.cta.href} className="inline-flex items-center justify-center gap-1.5">
                      {p.cta.label}
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                        strokeWidth={2.5}
                      />
                    </Link>
                  </Button>
                </div>
              </div>
            </MotionReveal>
          ))}
        </div>

        {/* Top-up callout */}
        <MotionReveal delay={0.2} className="mx-auto mt-6 max-w-5xl">
          <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-[#0F172A]/15 bg-[#FAFBFC] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 sm:items-center">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#0F172A] text-primary">
                <Plus className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#101828]">
                  Run out mid-month? Top up anytime.
                </div>
                <div className="mt-0.5 text-xs leading-relaxed text-[#667085] sm:text-sm">
                  Buy extra practice questions or AI credits whenever you need them — no plan change required.
                </div>
              </div>
            </div>
            {/* <Button
              variant="outline"
              asChild
              className="h-10 shrink-0 rounded-[12px] px-5 text-sm font-semibold"
            >
              <Link href="/topup">View top-ups</Link>
            </Button> */}
          </div>
        </MotionReveal>
      </div>
    </section>
  )
}