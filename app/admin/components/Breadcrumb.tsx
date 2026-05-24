"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400">
        {items.map((c, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="inline-flex items-center gap-1">
              {c.href && !isLast ? (
                <Link href={c.href} className="hover:text-[#F7C948] transition-colors">
                  {c.label}
                </Link>
              ) : (
                <span className={isLast ? "font-semibold text-slate-700 dark:text-zinc-200" : ""}>
                  {c.label}
                </span>
              )}
              {!isLast && <ChevronRight size={11} className="text-slate-300 dark:text-zinc-600" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
