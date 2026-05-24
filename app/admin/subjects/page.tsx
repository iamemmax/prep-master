"use client";

import Link from "next/link";
import { useAdminStore } from "../util/store";

export default function AdminSubjectsPage() {
  const subjects   = useAdminStore((s) => s.subjects);
  const exams      = useAdminStore((s) => s.exams);
  const categories = useAdminStore((s) => s.categories);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Subjects</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Every subject sits under a subcategory. Open its subcategory to add or edit subjects there.
        </p>
      </header>

      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 divide-y divide-slate-100 dark:divide-zinc-800">
        {subjects.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-400">
            No subjects yet. Open a subcategory to add one.
          </p>
        ) : (
          subjects.map((s) => {
            const exam = exams.find((e) => e.id === s.exam_id);
            const cat = exam ? categories.find((c) => c.id === exam.category_id) : undefined;
            return (
              <Link
                key={s.id}
                href={exam ? `/admin/exams/${exam.id}` : "/admin/exams"}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    {(cat?.name ?? "—") + " › " + (exam?.name ?? "—")}
                  </p>
                  <p className="text-sm font-semibold truncate">{s.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {s.difficulty_level === "easy" ? "Beginner" : s.difficulty_level === "medium" ? "Intermediate" : "Advanced"}
                  </p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">Open subcategory →</span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
