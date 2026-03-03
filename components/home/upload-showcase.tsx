"use client"
import Link from "next/link"
import {
  ArrowRight,
  CircleCheck,
  Brain,
  FileText,
  Image as ImageIcon,
  Upload,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import MotionReveal from "@/components/shared/motion-reveal"
import { cn } from "@/lib/utils"

const EXAM_CHIPS = [
  "JAMB",
  "WAEC",
  "NECO",
  "GCE",
  "UTME",
  "SAT",
  "GRE",
  "GMAT",
  "IELTS",
  "LSAT",
  "TOEFL",
  "ACT",
  "GED",
  "PSAT",
  "AP Exams",
  "CPA",
  "PMP",
  "ICAN",
  "CFA",
  "ACCA",
  "CISA",
  "CISM",
  "AWS Cert",
  "Azure",
  "GCP",
  "Google Cloud",
  "CompTIA",
  "CCNA",
  "Security+",
  "Nursing (NCLEX)",
  "USMLE",
  "MCAT",
  "BAR Exam",
  "Your own materials",
  "A-Level",
  "IB Exams",
  "Cambridge IGCSE",
  "O-Level",
]

function Bullet({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/15">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      </div>
      <div>
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="mt-0.5 text-xs leading-relaxed text-white/65 sm:text-sm">
          {description}
        </div>
      </div>
    </div>
  )
}

export default function UploadShowcase() {
  const marqueeChips = [...EXAM_CHIPS, ...EXAM_CHIPS]

  return (
    <section className="relative isolate overflow-hidden bg-[#292D32] font-inter">
      <div className="border-y border-border/80 bg-[#F8FAFC] py-3">
        <div className=" ">
          <div className="chips-marquee relative overflow-hidden">
            <div className="chips-track flex w-max items-center gap-2 whitespace-nowrap pr-2">
              {marqueeChips.map((chip, i) => {
                return (
                  <span
                    key={`${chip}-${i}`}
                    className={cn(
                      "shrink-0 rounded-full border border-border bg-white px-3 py-1 text-[10px] font-medium text-[#667085]",
                      "transition-colors cursor-pointer duration-200 hover:border-primary/40 hover:bg-primary hover:text-[#0F172A]"
                    )}
                  >
                    {chip}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-0 -z-10",
          "bg-[radial-gradient(900px_550px_at_85%_30%,rgba(236,178,46,0.18),transparent_60%)] ellipse-top"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 -z-10",
          "bg-[radial-gradient(900px_550px_at_85%_30%,rgba(236,178,46,0.18),transparent_60%)] ellipse-bottom"
        )}
      />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24 relative ">
        <div className="absolute w-[255px] h-[255px] bg-[#ECB22E] -left-30 top-[18px] opacity-10 blur-2xl rounded-full"></div>
        <div className="absolute w-[455px] h-[455px] bg-[#ECB22E] -right-30 bottom-0 opacity-10 blur-2xl rounded-full"></div>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left */}
          <MotionReveal className="font-inter">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white/80 ring-1 ring-white/15">
              <Brain className="h-4 w-4 text-white/80" strokeWidth={1.5} />
              AI-Powered Innovation
            </div>

            <h2 className="mt-6 font-jarkata text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-white sm:text-[42px]">
              Transform{" "}
              <span className="underline decoration-2 underline-offset-4 text-primary">
                Study Materials
              </span>{" "}
              into Practice Questions
            </h2>

            <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-[#CAD5E2] sm:text-base">
              Upload lecture notes, textbooks, or any study material. Our advanced AI analyzes your
              content and generates relevant, exam-style questions in seconds.
            </p>

            <div className="mt-8 space-y-5">
              <Bullet
                title="Multiple Format Support"
                description="Upload PDF, Word, PowerPoint, images, and more"
              />
              <Bullet
                title="Lightning-Fast Generation"
                description="Get practice questions in seconds, not hours"
              />
              <Bullet
                title="Contextually Intelligent"
                description="Questions perfectly tailored to your specific content"
              />
            </div>

            <div className="mt-10">
              <Button
                asChild
                className="h-14 rounded-[14px] px-6 min-w-[230px] font-semibold text-foreground "
              >
                <Link href="/upload">
                  Try AI Upload Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </MotionReveal>

          {/* Right */}
          <MotionReveal delay={0.12} y={18} className="relative">
            <div className="absolute -inset-8 -z-10 rounded-[32px] bg-linear-to-br from-white/5 via-transparent to-primary/10 blur-2xl" />

            <div className="rounded-3xl border border-white/10 bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
              <div className="rounded-2xl border border-border bg-white p-5">
                <div className="flex h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-muted">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="mt-3 text-sm font-semibold text-[#292D32]">
                    Drop your files here
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    or click to browse
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    Supports PDF, DOCX, PPTX, JPG, PNG
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-600 text-white">
                        <CircleCheck className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold text-[#292D32]">
                          biology_chapter_5.pdf
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          25 questions generated · 2.3 MB
                        </div>
                      </div>
                    </div>
                    <Zap className="h-4 w-4 text-emerald-700" />
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-[#314158] ring-1 ring-border">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold text-[#292D32]">
                          chemistry_notes.docx
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Analyzing content... 78%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ImageIcon className="h-4 w-4" />
                      <Upload className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </MotionReveal>
        </div>
      </div>

      <style jsx>{`
        .chips-track {
          animation: chips-marquee 52s linear infinite;
        }

        .chips-marquee:hover .chips-track {
          animation-play-state: paused;
        }

        @keyframes chips-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-50% - 0.25rem));
          }
        }
      `}</style>
    </section>
  )
}