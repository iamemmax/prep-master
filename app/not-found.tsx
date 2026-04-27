import Link from "next/link";
import { ArrowLeft, BookOpen, Compass, Home, LifeBuoy } from "lucide-react";
import PrepLogo from "@/utils/icons/logos/PrepLogo";

export const metadata = {
  title: "Lost the question — 404",
  description:
    "The page you tried to reach isn't on the syllabus. Head back home or jump into a practice session.",
};

const QUICK_LINKS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Your study home base",
    icon: Home,
  },
  {
    href: "/dashboard/practice",
    label: "Practice",
    description: "Pick up an exam",
    icon: BookOpen,
  },
  {
    href: "/signin",
    label: "Sign in",
    description: "Already have an account?",
    icon: Compass,
  },
  {
    href: "/support",
    label: "Support",
    description: "Tell us what broke",
    icon: LifeBuoy,
  },
] as const;

export default function NotFound() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#0b1220] text-white font-inter">
      {/* Decorative background — same vibe as the auth shell */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 40% at 20% 10%, rgba(236,178,46,0.18), transparent 60%), radial-gradient(50% 50% at 90% 90%, rgba(236,178,46,0.12), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-5xl flex-col px-6 py-10 lg:px-10">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <PrepLogo width={28} height={28} color="#ECB22E" />
            <span className="leading-tight">
              <span className="block text-lg font-semibold">PrepMaster</span>
              <span className="-mt-0.5 block text-[10px] text-white/60">by Upstage</span>
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs text-white/80 transition hover:border-white/25 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
        </header>

        {/* Hero */}
        <section className="flex flex-1 items-center py-16">
          <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Multi-choice 404 — the joke is that "the page you wanted" is
                marked wrong, and the right answer is to head home. */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ECB22E]/30 bg-[#ECB22E]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#ECB22E]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ECB22E]" />
                Question 404 of ∞
              </div>
              <h1 className="mt-4 font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                This question isn&apos;t
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(135deg, #ECB22E, #FE9A00)" }}
                >
                  on the syllabus.
                </span>
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
                We couldn&apos;t find that page. It may have moved, been retired, or
                never existed in the first place. Pick a path below — your study streak
                is still intact.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#ECB22E] px-5 py-2.5 text-sm font-semibold text-[#5A3300] shadow-[0_8px_24px_-12px_rgba(236,178,46,0.6)] transition hover:bg-[#f1c14d]"
                >
                  <Home className="h-4 w-4" />
                  Back to home
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:border-white/30 hover:bg-white/10"
                >
                  Go to dashboard
                </Link>
              </div>
            </div>

            {/* Visual: a "wrong answer" exam card. */}
            <div className="order-1 lg:order-2">
              <div className="relative mx-auto w-full max-w-md">
                <div
                  aria-hidden
                  className="absolute -inset-6 -z-10 rounded-[40px] opacity-60 blur-2xl"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(236,178,46,0.5), rgba(254,154,0,0.25), transparent)",
                  }}
                />
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                      Section · Errors
                    </span>
                    <span className="text-[10px] tabular-nums text-white/40">404 / 500</span>
                  </div>

                  <div className="mt-3 select-none font-heading text-[120px] font-black leading-none tracking-tight">
                    <span
                      className="bg-clip-text text-transparent"
                      style={{ backgroundImage: "linear-gradient(180deg, #ECB22E 0%, #FE9A00 100%)" }}
                    >
                      4
                    </span>
                    <span className="text-white/85">0</span>
                    <span
                      className="bg-clip-text text-transparent"
                      style={{ backgroundImage: "linear-gradient(180deg, #FE9A00 0%, #DC2626 100%)" }}
                    >
                      4
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-white/55">
                    Which option leads back to your study session?
                  </p>

                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-white/40 line-through">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-white/15 text-[10px] font-bold">
                        A
                      </span>
                      The page you tried
                    </li>
                    <li className="flex items-center gap-3 rounded-lg border border-[#ECB22E]/40 bg-[#ECB22E]/10 px-3 py-2 text-[#ECB22E]">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[#ECB22E]/50 text-[10px] font-bold">
                        B
                      </span>
                      Head home and try again
                    </li>
                    <li className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-white/55">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-white/15 text-[10px] font-bold">
                        C
                      </span>
                      Open the dashboard
                    </li>
                    <li className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-white/55">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-white/15 text-[10px] font-bold">
                        D
                      </span>
                      Both B and C
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick links */}
        <section className="pb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            Or jump straight to
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {QUICK_LINKS.map(link => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:border-[#ECB22E]/40 hover:bg-[#ECB22E]/5"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-white/90 group-hover:text-[#ECB22E]">
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </div>
                  <p className="mt-1 text-[11px] text-white/50">{link.description}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <footer className="border-t border-white/5 pt-4 text-[11px] text-white/40">
          PrepMaster · Even our 404s are a learning opportunity.
        </footer>
      </div>
    </main>
  );
}
