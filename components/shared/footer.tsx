import Link from "next/link"
import { Target } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import MotionReveal from "@/components/shared/motion-reveal"

const FOOTER_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Exams", href: "#exams" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
]

const LEGAL = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Cookies", href: "/cookies" },
]

export default function Footer() {
  return (
    <footer className="bg-[#1F2327] font-inter text-white">
      <div className="mx-auto max-w-375 px-4 py-17.25 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <MotionReveal className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white">
                <Target className="h-6 w-6" />
              </div>
              <div className="leading-tight">
                <div className="text-base font-bold">PrepMaster</div>
                <div className="-mt-0.5 text-xs text-white/60">by Upstage</div>
              </div>
            </Link>

            <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white">
              {FOOTER_LINKS.map((l) => (
                <a key={l.href} href={l.href} className="hover:text-white/80 font-light text-sm ">
                  {l.label}
                </a>
              ))}
            </nav>
          </MotionReveal>

          <MotionReveal delay={0.08} className="w-full max-w-md">
            <div className="text-sm font-medium font-jarkata tracking-[-0.02em]">Stay up to date</div>
            <div className="mt-3 flex gap-1.5">
              <Input
                type="email"
                placeholder="Enter your email"
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                className="h-11 rounded-full border-white/15 bg-white text-foreground placeholder:text-foreground/80  focus-visible:ring-accent/15"
              />
              <Button
                data-lpignore="true"
                className="h-11 rounded-full px-5 font-normal text-foreground btn-glow hover:bg-primary/90"
              >
                Subscribe
              </Button>
            </div>
          </MotionReveal>
        </div>

        <MotionReveal delay={0.14} className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} Prepmaster. All rights reserved.</div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>
        </MotionReveal>
      </div>
    </footer>
  )
}