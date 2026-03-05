import Link from "next/link"
import { ArrowLeft } from "lucide-react"

type AuthStepHeaderProps = {
  backHref: string
  backLabel: string
  stepLabel?: string
  progress?: number
  showProgress?: boolean
}

export default function AuthStepHeader({
  backHref,
  backLabel,
  stepLabel,
  progress = 1,
  showProgress = true,
}: AuthStepHeaderProps) {
  const safe = Math.min(3, Math.max(1, progress))

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-3">
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-[#94A3B8]">
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>
        {stepLabel ? (
          <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            {stepLabel}
          </span>
        ) : null}
      </div>

      {showProgress ? (
        <div className="mt-4 flex items-center gap-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <span
              key={idx}
              className={[
                "transition",
                idx < safe ? "bg-primary w-[32px] h-[6px] rounded" : "bg-[#E2E8F0] w-[8px] h-[6px] rounded-full",
              ].join(" ")}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
