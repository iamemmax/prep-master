"use client"
import { Badge } from "@/components/ui/badge"
import MotionReveal from "@/components/shared/motion-reveal"
import { Star } from "lucide-react"

type Testimonial = {
  name: string
  subtitle: string
  quote: string
  stars: number
  score: string
}
const TESTIMONIALS: Testimonial[] = [
  {
    name: "Adewale Johnson",
    subtitle: "JAMB Candidate, 2025",
    quote:
      "I failed JAMB twice before finding PrepMaster. The third time, I scored 315. The AI knew exactly which topics I kept getting wrong and drilled me until I got them right.",
    stars: 5,
    score: "315/400",
  },
  {
    name: "Sarah Mitchell",
    subtitle: "SAT Student, New York",
    quote:
      "Six weeks, 200 points. I was stuck at 1280 for months. PrepMaster's weak-spot tracking showed me I was losing points on one specific question type — fixed that, score jumped immediately.",
    stars: 5,
    score: "1480/1600",
  },
  {
    name: "Dr. Emmanuel Okafor",
    subtitle: "USMLE Step 1 Candidate",
    quote:
      "I uploaded my lecture notes and got a 200-question practice set in minutes. No other platform does that. Passed Step 1 on my first attempt with a competitive score.",
    stars: 5,
    score: "Top 1%",
  },
  {
    name: "Fatima Al-Rashidi",
    subtitle: "A-Level Student, Dubai",
    quote:
      "My school doesn't have great teachers for Further Maths. PrepMaster basically became my tutor. I went from a D to an A* in one term — my parents couldn't believe it.",
    stars: 5,
    score: "A*",
  },
  {
    name: "Chukwuemeka Nwosu",
    subtitle: "WAEC Candidate, 2024",
    quote:
      "The exam simulations are scary accurate. When I sat the real WAEC, it felt like I had seen the questions before. Finished with distinctions in all 9 subjects.",
    stars: 5,
    score: "9 distinctions",
  },
  {
    name: "Priya Sharma",
    subtitle: "GMAT Applicant, MBA 2025",
    quote:
      "I had 3 weeks before my GMAT retake. PrepMaster's adaptive quizzes focused only on what I was weak at — no wasted time. Hit my target score and got into Wharton.",
    stars: 5,
    score: "740/800",
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1 text-[#0F172A]">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-3.5 w-3.5"
          fill={i < count ? "currentColor" : "none"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

export default function Testimonials() {
  const marqueeItems = [...TESTIMONIALS, ...TESTIMONIALS]

  return (
    <section className="bg-white font-inter overflow-clip">
      <div className=" py-16  lg:py-24">
        <MotionReveal className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="bg-muted/60 text-muted-foreground">
            Testimonials
          </Badge>
          <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-[#292D32] sm:text-[48px]">
            Loved by Students Worldwide
          </h2>
          <p className="mx-auto -mt-2 font-light max-w-4xl text-pretty text-sm text-muted-foreground sm:mt-4 sm:text-xl">
            Join thousands of successful students who achieved their goals with PrepMaster
          </p>
        </MotionReveal>

        <div className="marquee relative max-w-375 mx-auto mt-12">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-white to-transparent" />

          <div className="marquee-track flex w-max gap-6 py-1 pr-6 motion-reduce:animate-none">
            {marqueeItems.map((t, idx) => (
              <div
                key={`${t.name}-${idx}`}
                className="w-[380px] flex flex-col justify-between shrink-0 rounded-2xl border border-border bg-white py-6 px-[36px] shadow-sm transition-shadow hover:shadow-md"
              >
                <Stars count={t.stars} />
                <p className="mt-4 text-sm leading-relaxed text-[#45556C]">“{t.quote}”</p>

                <div className="mt-[60px] flex items-center justify-between gap-3 border-t pt-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-[#0F172A] text-xs font-semibold text-white">
                      {t.name
                        .split(" ")
                        .slice(0, 2)
                        .map((p) => p[0])
                        .join("")}
                    </div>
                    <div className="min-w-0 ">
                      <div className="truncate text-sm font-semibold text-[#292D32]">{t.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{t.subtitle}</div>
                    </div>
                  </div>
                  <div className="shrink-0 rounded-full bg-[#F1F5F9] px-3 py-1 text-[10px] font-medium text-[#334155]">
                    {t.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .marquee {
          overflow: hidden;
        }

        .marquee-track {
          animation: testimonials-marquee 40s linear infinite;
        }

        .marquee:hover .marquee-track {
          animation-play-state: paused;
        }

        @keyframes testimonials-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-50% - 0.75rem));
          }
        }
      `}</style>
    </section>
  )
}