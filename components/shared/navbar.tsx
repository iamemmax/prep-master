// src/components/shared/navbar.tsx
"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Menu, Target } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type NavItem = { label: string; href: string }

const NAV: NavItem[] = [
  { label: "Features", href: "#features" },
  { label: "Exams", href: "#exams" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
]

/**
 * If your landing page is a single page with sections, these are usually anchors.
 * If you later split pages, just swap hrefs to /features etc.
 */
function scrollToHash(href: string) {
  if (!href.startsWith("#")) return
  const el = document.querySelector(href)
  if (!el) return
  el.scrollIntoView({ behavior: "smooth", block: "start" })
}

export default function Navbar({
  className,
  brandTitle = "PrepMaster",
  brandSubtitle = "by Upstage",
  onSignInHref = "/signin",
  primaryCtaHref = "/get-started",
}: {
  className?: string
  brandTitle?: string
  brandSubtitle?: string
  onSignInHref?: string
  primaryCtaHref?: string
}) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky h-[66px] top-0 z-50 w-full font-inter transition-colors",
        "bg-white backdrop-blur supports-backdrop-filter:bg-background/70",
        scrolled ? "border-b border-border shadow-sm" : "border-b border-transparent",
        className
      )}
    >
      <div className="mx-auto flex  max-w-full h-full py-2 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <span className="text-sm font-bold"><Target /></span>
          </div>
          <div className="leading-tight">
            <div className="text-xl font-bold text-[#292D32]">
              {brandTitle}
            </div>
            <div className="-mt-1 font-medium text-xs text-muted-foreground">{brandSubtitle}</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                if (item.href.startsWith("#")) {
                  e.preventDefault()
                  scrollToHash(item.href)
                }
              }}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={onSignInHref}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Sign In
          </Link>

          <Button asChild className="rounded-[14px] px-5.5 py-2 font-medium text-foreground btn-primary">
            <Link href={primaryCtaHref}>Get Started Free</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[320px] sm:w-95">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <span className="text-sm font-bold">◎</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">{brandTitle}</div>
                    <div className="text-xs text-muted-foreground">
                      {brandSubtitle}
                    </div>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                <div className="space-y-1">
                  {NAV.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={(e) => {
                        if (item.href.startsWith("#")) {
                          e.preventDefault()
                          scrollToHash(item.href)
                        }
                      }}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button asChild variant="outline" className="w-full rounded-full">
                    <Link href={onSignInHref}>Sign In</Link>
                  </Button>

                  <Button asChild className="w-full rounded-full">
                    <Link href={primaryCtaHref}>Get Started Free</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}