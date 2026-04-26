"use client";

const IS_PROD = process.env.NEXT_PUBLIC_NODE_ENV === "production";

export function isProductionGated() {
  return IS_PROD;
}

export default function ComingSoonGate({
  children,
  label = "Soon",
  className = "",
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
}) {
  if (!IS_PROD) return <>{children}</>;

  return (
    <div className={`relative ${className} hidden`}>
      <div
        className="pointer-events-none select-none blur-[9px] opacity-70"
        aria-hidden="true"
      >
        {children}
      </div>
      <div className="absolute top-2.5 right-2.5 z-10">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/85 dark:bg-zinc-900/85 backdrop-blur-sm border border-slate-200/70 dark:border-zinc-700/70 text-[10px] font-medium uppercase tracking-[0.1em] text-slate-500 dark:text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          {label}
        </span>
      </div>
    </div>
  );
}