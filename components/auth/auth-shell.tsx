import Link from "next/link"
import {
  CheckCircle2,
  Globe,
  ShieldCheck,
  
  Target,
  Users,
} from "lucide-react"

type AuthShellProps = {
  children: React.ReactNode
}

const LEFT_POINTS = [
  {
    icon: Users,
    title: "Access unlimited questions",
    description:
      "Practice with AI-generated and curated exam questions tailored to your goals.",
  },
  {
    icon: Target,
    title: "Ensure compliance",
    description:
      "Get clear progress tracking and structured milestones to stay exam-ready.",
  },
  {
    icon: ShieldCheck,
    title: "Built-in security",
    description:
      "Your account and study data are protected with secure-by-default controls.",
  },
]
// 
export default function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="grid relative auth-bg h-screen lg:grid-cols-[600px_1fr] font-inter">
      <aside className="hidden lg:block sticky top-0 h-full px-10 py-12 text-white">
        <div className=" flex justify-between h-full flex-col max-w-95 mx-auto">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/20 text-primary ring-1 ring-primary/40">
                <Target className="h-4 w-4" />
              </span>
              <span className="leading-tight">
                <span className="block text-2xl font-semibold">PrepMaster</span>
                <span className="-mt-1 block text-xs text-white/65">by Upstage</span>
              </span>
            </Link>

            <h2 className="mt-10 text-[28px] font-semibold leading-tight">
              Start your exam prepping for free
            </h2>
            <div className="mt-1 inline-flex items-center gap-2 text-sm text-[#8996A9]">
              <CheckCircle2 className="h-4 w-4" />
              No credit card required
            </div>
          </div>

          <div className=" space-y-9">
            {LEFT_POINTS.map((point) => {
              const Icon = point.icon
              return (
                <div key={point.title} className="max-w-70">
                  <Icon className="h-4 w-4 text-primary" />

                  <div className="mt-3 text-base">{point.title}</div>
                  <p className="mt-1.5 text-xs leading-normal text-[#8996A9]">
                    {point.description}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="mt-8 flex items-center gap-3 text-xs text-white/60">
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/docs" className="hover:text-white">
              Docs
            </Link>
            <span>•</span>
            <Link href="/help" className="hover:text-white">
              Helps
            </Link>
            <span className="ml-3 inline-flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" /> English
            </span>
          </div>
        </div>
      </aside>
     
      <main className="h-full w-full bg-white flex flex-col md:flex-row md:items-center md:justify-center overflow-y-auto">
        <div className="lg:hidden p-4">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/20 text-primary ring-1 ring-primary/40">
            <Target className="h-4 w-4" />
          </span>
          <span className="leading-tight">
            <span className="block text-2xl font-semibold">PrepMaster</span>
            <span className="-mt-1 block text-xs text-[#8996A9]">by Upstage</span>
          </span>
        </Link>
        </div>
        <div className="mx-auto w-full max-w-2xl p-3 lg:p-10">{children}</div>
      </main>
    </div>
  )
}
