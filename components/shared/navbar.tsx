// src/components/shared/navbar.tsx
"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, Target } from "lucide-react"
import { useAuth } from "@/context/authentication"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
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
  primaryCtaHref = "/signup",
}: {
  className?: string
  brandTitle?: string
  brandSubtitle?: string
  onSignInHref?: string
  primaryCtaHref?: string
}) {
  const { authState, authDispatch } = useAuth()
  const { isAuthenticated } = authState
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [activeHash, setActiveHash] = useState<string>("")

  const handleLogout = () => {
    authDispatch({ type: "LOGOUT" })
    router.push("/")
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Scroll-spy: mark a nav item active while its section sits in the viewport.
  // The negative top rootMargin (~ header height) keeps the indicator from
  // flipping early as a section first scrolls under the sticky header. The
  // negative bottom margin (-55%) means a section only "activates" once its
  // top crosses roughly the upper third of the viewport — the spot a reader
  // actually focuses on. Without that, a tall section like Hero would lose
  // its active state the moment the next section peeked in from below.
  useEffect(() => {
    const ids = NAV
      .map(n => n.href)
      .filter(h => h.startsWith("#"))
      .map(h => h.slice(1))
    const sections = ids
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActiveHash(`#${visible[0].target.id}`)
      },
      {
        rootMargin: "-72px 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    )

    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full h-16 font-inter transition-colors",
        "bg-white",
        scrolled ? "border-b border-border shadow-sm" : "border-b border-transparent",
        className
      )}
    >
      <div className="mx-auto flex max-w-375 w-full  h-full items-center justify-between px-4 sm:px-8 lg:px-5">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Target className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-base sm:text-xl font-bold text-[#292D32]">{brandTitle}</div>
            <div className="-mt-0.5 font-medium text-xs text-muted-foreground">{brandSubtitle}</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => {
            const isActive = item.href === activeHash
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  if (item.href.startsWith("#")) {
                    e.preventDefault()
                    scrollToHash(item.href)
                  }
                }}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative text-sm transition-colors",
                  isActive
                    ? "font-semibold text-primary after:absolute after:left-0 after:right-0 after:-bottom-1.5 after:h-0.5 after:rounded-full after:bg-primary"
                    : "font-medium text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex shrink-0">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Logout
            </button>
          ) : (
            <Link href={onSignInHref} className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Sign In
            </Link>
          )}
          <Button asChild className="rounded-xl px-5 py-2 font-medium text-foreground btn-primary">
            <Link href={isAuthenticated ? "/dashboard" : primaryCtaHref}>
              {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
            </Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="lg:hidden">
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

            <SheetContent side="right" className="w-70 sm:w-[320px] flex flex-col">
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shrink-0">
                    <Target className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">{brandTitle}</div>
                    <div className="text-xs text-muted-foreground">{brandSubtitle}</div>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 flex flex-col flex-1 gap-4">
                {/* Nav Links */}
                <div className="space-y-1">
                  {NAV.map((item) => {
                    const isActive = item.href === activeHash
                    return (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          onClick={(e) => {
                            if (item.href.startsWith("#")) {
                              e.preventDefault()
                              scrollToHash(item.href)
                            }
                          }}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "block rounded-lg px-3 py-2.5 text-sm transition-colors",
                            isActive
                              ? "font-semibold text-primary bg-primary/10"
                              : "font-medium text-foreground hover:bg-muted"
                          )}
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    )
                  })}
                </div>

                <Separator />

                {/* CTA Buttons — pushed to bottom on tall screens */}
                <div className="mt-auto space-y-3 p-3 pb-4">
                  {isAuthenticated ? (
                    <Button variant="outline" className="w-full rounded-xl h-11" onClick={handleLogout}>
                      Logout
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="w-full rounded-xl h-11">
                      <Link href={onSignInHref}>Sign In</Link>
                    </Button>
                  )}
                  <Button asChild className="w-full rounded-xl h-11 font-medium text-foreground btn-primary">
                    <Link href={isAuthenticated ? "/dashboard" : primaryCtaHref}>
                      {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
                    </Link>
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