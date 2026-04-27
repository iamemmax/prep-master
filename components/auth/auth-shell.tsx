import Link from "next/link"
import {
  CheckCircle2,
  Globe,
  ShieldCheck,
  
  Target,
  Users,
} from "lucide-react"
import PrepLogo from "@/utils/icons/logos/PrepLogo"

type AuthShellProps = {
  children: React.ReactNode
}

const LEFT_POINTS = [
  {
    icon: CheckCircle2,
    title: "Start your exam prepping for free",
    description:
      "No credit card required.",
  },
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
// auth layout
export default function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="grid relative h-screen md:grid-cols-[1fr_1fr] font-inter">
      <aside className="hidden md:block sticky top-0 h-full auth-bg px-10 xl:px-20 py-12 text-white">
        <div className=" flex h-full flex-col max-w-2xl mx-auto">
          <div>
            <Link href="/" className="inline-flex items-start gap-2">
             <div className="">
               <PrepLogo width={30} height={30} color="#ECB22E"/>
             </div>
              <span className="">
                <span className="block text-2xl font-semibold">PrepMaster</span>
                <span className="-mt-1 block text-xs text-white/65">by Upstage</span>
              </span>
            </Link>

            {/* <h2 className="mt-10 text-[28px] font-semibold leading-tight">
              Start your exam prepping for freea
            </h2>
            <div className="mt-1 inline-flex items-center gap-2 text-sm text-[#8996A9]">
              <CheckCircle2 className="h-4 w-4" />
              No credit card required
            </div> */}
          </div>

          <div className="flex-1 flex items-center">
          <div className="w-full space-y-6 xl:space-y-8 2xl:space-y-12">
            {LEFT_POINTS?.map((point) => {
              const Icon = point.icon
              return (
                <div key={point.title} className="flex items-start gap-5 ">
                  <div className="bg-[#4b462b5c] w-10 h-10 shrink-0 rounded-full flex justify-center items-center">
                  <Icon className="h-5 w-5 text-primary" />

                  </div>

                  <div className= "text-sm lg:text-lg xl:text-lg 2xl:text-xl max-w-sm">
                    <h2 className="font-inter ">
                    {point.title}
                    </h2>
                  <p className="mt-1.5 text-xs md:text-sm xl:text-sm 2xl:text-base leading-normal font-inter text-[#8996A9]">
                    {point.description}
                  </p>
                    </div>
                </div>
              )
            })}
          </div>
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
     
      <main className="h-full w-full bg-white flex flex-col md:flex-row md:items-start pt-6 lg:pt-14.5 md:justify-center overflow-y-auto hide-scrollbar">
        <div className="md:hidden p-4">
        <Link href="/" className="inline-flex items-center flex-wrap gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/20 text-primary ring-1 ring-primary/40">
            <Target className="h-4 w-4" />
          </span>
          <span className="leading-tight">
            <span className="block text-2xl font-semibold">PrepMaster</span>
            <span className="-mt-1 block text-xs text-[#8996A9]">by Upstage</span>
          </span>
        </Link>
        </div>
        <div className="mx-auto w-full max-w-2xl ">{children}</div>
      </main>
    </div>
  )
}
