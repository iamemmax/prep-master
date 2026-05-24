"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useAdminStore, countSubjectsForExam, countQuestionsForExam } from "../util/store";

export default function AdminExamsPage() {
  const exams = useAdminStore((s) => s.exams);
  const categories = useAdminStore((s) => s.categories);
  const subjects = useAdminStore((s) => s.subjects);
  const questions = useAdminStore((s) => s.questions);
  const deleteExam = useAdminStore((s) => s.deleteExam);

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | "all">("all");
  const [access, setAccess] = useState<"all" | "free" | "premium">("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exams.filter((e) => {
      if (categoryId !== "all" && e.category_id !== categoryId) return false;
      if (access === "free" && e.is_premium) return false;
      if (access === "premium" && !e.is_premium) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.country?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [query, categoryId, access, exams]);

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Delete subcategory "${name}"? Its subjects and questions will also be removed.`)) deleteExam(id);
  };

  return (
    <div>
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Subcategories</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            A subcategory (exam) sits under a category and owns its subjects and questions.
          </p>
        </div>
        <Link
          href="/admin/exams/new"
          className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-2 rounded-lg text-xs font-semibold bg-[#F7C948] text-white hover:opacity-90"
        >
          <Plus size={14} /> New subcategory
        </Link>
      </header>

      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-50 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exams…"
              className="w-full h-9 pl-8 pr-3 rounded-lg text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948] transition-colors"
            />
          </div>

          <select
            value={categoryId === "all" ? "all" : String(categoryId)}
            onChange={(e) => setCategoryId(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="h-9 px-2 rounded-lg text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948]"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={access}
            onChange={(e) => setAccess(e.target.value as typeof access)}
            className="h-9 px-2 rounded-lg text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948]"
          >
            <option value="all">Free + Premium</option>
            <option value="free">Free only</option>
            <option value="premium">Premium only</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-zinc-950/40 text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              <tr>
                <th className="text-left font-semibold px-4 py-2.5">Subcategory</th>
                <th className="text-left font-semibold px-4 py-2.5 hidden md:table-cell">Category</th>
                <th className="text-left font-semibold px-4 py-2.5 hidden lg:table-cell">Country</th>
                <th className="text-left font-semibold px-4 py-2.5">Access</th>
                <th className="text-right font-semibold px-4 py-2.5 hidden sm:table-cell">Subjects</th>
                <th className="text-right font-semibold px-4 py-2.5 hidden sm:table-cell">Questions</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => {
                const cat = categories.find((c) => c.id === e.category_id);
                return (
                  <tr key={e.id} className="border-t border-slate-100 dark:border-zinc-800">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{e.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-xs">{e.description}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-500 dark:text-zinc-400">{cat?.name ?? "—"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-500 dark:text-zinc-400">{e.country ?? "—"}</td>
                    <td className="px-4 py-3">
                      {e.is_premium ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF4DF] text-[#894B00] border border-[#F7C948]/40">Premium</span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Free</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-right tabular-nums">{countSubjectsForExam(subjects, e.id)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-right tabular-nums">{countQuestionsForExam(subjects, questions, e.id)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-3">
                        <Link
                          href={`/admin/exams/${e.id}`}
                          className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-zinc-300 hover:text-[#F7C948]"
                        >
                          <Pencil size={12} /> Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(e.id, e.name)}
                          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                    No exams match the current filters.
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
