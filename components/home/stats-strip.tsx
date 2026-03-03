import { LayoutGrid, TrendingUp, Users, MessageSquareText, Target } from "lucide-react"
import MotionReveal from "@/components/shared/motion-reveal"

type Stat = {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}

const STATS: Stat[] = [
  { value: "50,000+", label: "Practice Questions", icon: MessageSquareText },
  { value: "100+", label: "Exam Categories", icon: LayoutGrid },
  { value: "25,000+", label: "Active Students", icon: Users },
  { value: "86%", label: "Avg Pass Rate", icon: TrendingUp },
]

export default function StatsStrip() {
  return (
    <section className="bg-[#292D32]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((s, idx) => {
            const Icon = s.icon
            return (
              <MotionReveal
                key={s.label}
                delay={idx * 0.05}
                y={12}
                className="flex items-center gap-3  px-4 py-3 "
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xl font-jarkata tracking-wide font-semibold text-white sm:text-[32px]">
                    {s.value}
                  </div>
                  <div className="truncate text-[10px] sm:text-xs font-inter text-[#90A1B9]">
                    {s.label}
                  </div>
                </div>
              </MotionReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}