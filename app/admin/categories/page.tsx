"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useAdminStore, countExamsForCategory } from "../util/store";

export default function AdminCategoriesPage() {
  const categories = useAdminStore((s) => s.categories);
  const exams = useAdminStore((s) => s.exams);
  const deleteCategory = useAdminStore((s) => s.deleteCategory);
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? categories.filter((c) => c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q))
      : categories;
    return [...list].sort((a, b) => a.order - b.order);
  }, [query, categories]);

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Delete category "${name}"? This will also remove its exams.`)) deleteCategory(id);
  };

  return (
    <div>
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Top-level groupings shown on the exam library page.
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-2 rounded-lg text-xs font-semibold bg-[#F7C948] text-white hover:opacity-90"
        >
          <Plus size={14} /> New category
        </Link>
      </header>

      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search categories…"
              className="w-full h-9 pl-8 pr-3 rounded-lg text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948] transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-zinc-950/40 text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              <tr>
                <th className="text-left font-semibold px-4 py-2.5">Order</th>
                <th className="text-left font-semibold px-4 py-2.5">Name</th>
                <th className="text-left font-semibold px-4 py-2.5 hidden sm:table-cell">Region</th>
                <th className="text-right font-semibold px-4 py-2.5">Exams</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 dark:border-zinc-800">
                  <td className="px-4 py-3 tabular-nums text-slate-500">{c.order}</td>
                  <td className="px-4 py-3 font-semibold">{c.name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-slate-500 dark:text-zinc-400">{c.region}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{countExamsForCategory(exams, c.id)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-3">
                      <Link
                        href={`/admin/categories/${c.id}`}
                        className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-zinc-300 hover:text-[#F7C948]"
                      >
                        <Pencil size={12} /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                    No categories yet. Click <span className="font-semibold">+ New category</span>.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
