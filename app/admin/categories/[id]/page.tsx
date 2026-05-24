"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryForm from "../../components/CategoryForm";
import Breadcrumb from "../../components/Breadcrumb";
import { useAdminStore } from "../../util/store";

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const numericId = Number(id);
  const categories = useAdminStore((s) => s.categories);
  const allExams = useAdminStore((s) => s.exams);
  const category = useMemo(() => categories.find((c) => c.id === numericId), [categories, numericId]);
  const exams = useMemo(() => allExams.filter((e) => e.category_id === numericId), [allExams, numericId]);

  if (!category) return notFound();

  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Categories", href: "/admin/categories" },
          { label: category.name },
        ]}
      />
      <CategoryForm mode="edit" initial={category} />

      <section className="max-w-xl">
        <header className="flex items-end justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold">Subcategories in this category</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {exams.length} {exams.length === 1 ? "subcategory" : "subcategories"} mapped to {category.name}.
            </p>
          </div>
          <Link
            href={`/admin/exams/new?category=${category.id}`}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90"
          >
            + Add subcategory
          </Link>
        </header>

        <div className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 divide-y divide-slate-100 dark:divide-zinc-800">
          {exams.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-400 text-center">No exams yet.</p>
          ) : (
            exams.map((e) => (
              <Link
                key={e.id}
                href={`/admin/exams/${e.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold">{e.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-xs">{e.description}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  e.is_premium
                    ? "bg-[#FFF4DF] text-[#894B00] border border-[#F7C948]/40"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}>
                  {e.is_premium ? "Premium" : "Free"}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
