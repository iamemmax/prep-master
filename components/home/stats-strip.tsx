// StatsStrip.tsx
import { LayoutGrid, TrendingUp, Users, MessageSquareText } from "lucide-react"
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 divide-x divide-y divide-white/10 md:grid-cols-4 md:divide-y-0">
          {STATS.map((s, idx) => {
            const Icon = s.icon
            return (
              <MotionReveal
                key={s.label}
                delay={idx * 0.06}
                y={10}
                className="flex items-center gap-3.5 px-6 py-7"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold tracking-tight text-white sm:text-[32px]">
                    {s.value}
                  </div>
                  <div className="mt-0.5 text-[11px] font-medium text-[#90A1B9] sm:text-xs">
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