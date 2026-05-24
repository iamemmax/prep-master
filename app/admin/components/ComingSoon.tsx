import { Construction } from "lucide-react";

export default function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">{description}</p>
      </header>
      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-10 text-center">
        <Construction size={28} className="mx-auto text-[#F7C948]" />
        <p className="mt-3 text-sm font-semibold">Coming soon</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
          This section is scaffolded and will be wired up once Categories &amp; Exams are confirmed.
        </p>
      </div>
    </div>
  );
}
