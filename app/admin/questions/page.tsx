"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminStore } from "../util/store";

function difficultyLabel(d: string) {
  switch (d) {
    case "easy":   return "Beginner";
    case "medium": return "Intermediate";
    case "hard":   return "Advanced";
    default:       return d;
  }
}

export default function AdminQuestionsListPage() {
  const categories = useAdminStore((s) => s.categories);
  const exams      = useAdminStore((s) => s.exams);
  const subjects   = useAdminStore((s) => s.subjects);
  const questions  = useAdminStore((s) => s.questions);
  const deleteQuestion = useAdminStore((s) => s.deleteQuestion);

  const [filterCategoryId, setFilterCategoryId]       = useState<number | "">("");
  const [filterSubcategoryId, setFilterSubcategoryId] = useState<number | "">("");
  const [filterSubjectId, setFilterSubjectId]         = useState<number | "">("");

  const filterSubcategoryOptions = useMemo(
    () => (filterCategoryId ? exams.filter((e) => e.category_id === filterCategoryId) : []),
    [exams, filterCategoryId],
  );
  const filterSubjectOptions = useMemo(
    () => (filterSubcategoryId ? subjects.filter((s) => s.exam_id === filterSubcategoryId) : []),
    [subjects, filterSubcategoryId],
  );

  const rows = useMemo(() => {
    return questions.filter((q) => {
      const sub  = subjects.find((s) => s.id === q.subject_id);
      const exam = sub ? exams.find((e) => e.id === sub.exam_id) : undefined;
      if (filterCategoryId    && exam?.category_id !== filterCategoryId) return false;
      if (filterSubcategoryId && sub?.exam_id      !== filterSubcategoryId) return false;
      if (filterSubjectId     && q.subject_id      !== filterSubjectId) return false;
      return true;
    });
  }, [questions, subjects, exams, filterCategoryId, filterSubcategoryId, filterSubjectId]);

  const breadcrumbFor = (subjectId: number) => {
    const sub = subjects.find((s) => s.id === subjectId);
    const exam = sub ? exams.find((e) => e.id === sub.exam_id) : undefined;
    const cat = exam ? categories.find((c) => c.id === exam.category_id) : undefined;
    return [cat?.name ?? "—", exam?.name ?? "—", sub?.name ?? "—"].join(" › ");
  };

  return (
    <div>
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Questions</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Browse every question across the library. Use the tabs on the create page for bulk, manual, or AI entry.
          </p>
        </div>
        <Link
          href="/admin/questions/new"
          className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-2 rounded-lg text-xs font-semibold bg-[#F7C948] text-white hover:opacity-90"
        >
          <Plus size={14} /> New question
        </Link>
      </header>

      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 shrink-0">Filter:</span>

          <FilterSelect
            value={filterCategoryId}
            onChange={(v) => { setFilterCategoryId(v); setFilterSubcategoryId(""); setFilterSubjectId(""); }}
            placeholder="All categories"
            options={categories.map((c) => ({ id: c.id, label: c.name }))}
          />
          <FilterSelect
            value={filterSubcategoryId}
            onChange={(v) => { setFilterSubcategoryId(v); setFilterSubjectId(""); }}
            placeholder="All subcategories"
            disabled={!filterCategoryId}
            options={filterSubcategoryOptions.map((e) => ({ id: e.id, label: e.name }))}
          />
          <FilterSelect
            value={filterSubjectId}
            onChange={setFilterSubjectId}
            placeholder="All subjects"
            disabled={!filterSubcategoryId}
            options={filterSubjectOptions.map((s) => ({ id: s.id, label: s.name }))}
          />

          {(filterCategoryId || filterSubcategoryId || filterSubjectId) && (
            <button
              onClick={() => { setFilterCategoryId(""); setFilterSubcategoryId(""); setFilterSubjectId(""); }}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-zinc-200 underline underline-offset-2"
            >
              Clear
            </button>
          )}

          <span className="ml-auto text-xs text-slate-500 dark:text-zinc-400 shrink-0">
            {rows.length} {rows.length === 1 ? "question" : "questions"}
          </span>
        </div>

        <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
          {rows.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-slate-400">
              No questions yet. Click <span className="font-semibold">+ New question</span>.
            </li>
          ) : (
            rows.map((q) => {
              const correct = q.options.find((o) => o.is_correct);
              return (
                <li key={q.id} className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">
                        {breadcrumbFor(q.subject_id)}
                      </p>
                      <p className="text-sm font-semibold">{q.text}</p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        {difficultyLabel(q.difficulty_level)}
                      </p>
                      {correct && (
                        <p className="text-[11px] text-emerald-600 mt-1">
                          Answer: <span className="font-semibold">{correct.key}.</span> {correct.text}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Link
                        href={`/admin/questions/${q.id}`}
                        className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-zinc-300 hover:text-[#F7C948]"
                      >
                        <Pencil size={12} /> Edit
                      </Link>
                      <button
                        onClick={() => { if (confirm("Delete this question?")) deleteQuestion(q.id); }}
                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}

function FilterSelect({
  value, onChange, placeholder, options, disabled,
}: {
  value: number | "";
  onChange: (v: number | "") => void;
  placeholder: string;
  options: { id: number; label: string }[];
  disabled?: boolean;
}) {
  return (
    <Select
      value={value ? String(value) : "__all"}
      onValueChange={(v) => onChange(v === "__all" ? "" : Number(v))}
      disabled={disabled}
    >
      <SelectTrigger size="sm" className="bg-slate-50 dark:bg-zinc-800 text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all">{placeholder}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.id} value={String(o.id)}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
