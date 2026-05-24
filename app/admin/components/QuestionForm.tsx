"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminQuestion, useAdminStore } from "../util/store";

function emptyOptions() {
  return [
    { key: "A", text: "", is_correct: false },
    { key: "B", text: "", is_correct: false },
    { key: "C", text: "", is_correct: false },
    { key: "D", text: "", is_correct: false },
  ];
}

interface Props {
  mode: "create" | "edit";
  initial?: AdminQuestion;
}

export default function QuestionForm({ mode, initial }: Props) {
  const router = useRouter();
  const search = useSearchParams();
  const presetSubject = search.get("subject");

  const categories = useAdminStore((s) => s.categories);
  const exams      = useAdminStore((s) => s.exams);
  const subjects   = useAdminStore((s) => s.subjects);
  const createQuestion = useAdminStore((s) => s.createQuestion);
  const updateQuestion = useAdminStore((s) => s.updateQuestion);

  // Cascading hierarchy state ─ Category → Subcategory → Subject
  const initialSubject = initial ? subjects.find((s) => s.id === initial.subject_id) : undefined;
  const initialExam    = initialSubject ? exams.find((e) => e.id === initialSubject.exam_id) : undefined;

  const [categoryId, setCategoryId]       = useState<number | "">(initialExam?.category_id ?? "");
  const [subcategoryId, setSubcategoryId] = useState<number | "">(initialSubject?.exam_id ?? "");
  const [subjectId, setSubjectId]         = useState<number | "">(initial?.subject_id ?? "");
  const [text, setText]                   = useState(initial?.text ?? "");
  const [explanation, setExplanation]     = useState(initial?.explanation ?? "");
  const [difficulty, setDifficulty]       = useState<AdminQuestion["difficulty_level"]>(initial?.difficulty_level ?? "medium");
  const [options, setOptions]             = useState(initial ? initial.options.map((o) => ({ ...o })) : emptyOptions());

  const subcategoryOptions = useMemo(
    () => (categoryId ? exams.filter((e) => e.category_id === categoryId) : []),
    [exams, categoryId],
  );
  const subjectOptions = useMemo(
    () => (subcategoryId ? subjects.filter((s) => s.exam_id === subcategoryId) : []),
    [subjects, subcategoryId],
  );

  // Pre-populate the chain when /new?subject=ID was used.
  useEffect(() => {
    if (mode !== "create" || !presetSubject) return;
    const sId = Number(presetSubject);
    const sub  = subjects.find((s) => s.id === sId);
    const exam = sub ? exams.find((e) => e.id === sub.exam_id) : undefined;
    if (exam) { setCategoryId(exam.category_id); setSubcategoryId(exam.id); }
    if (sub)  setSubjectId(sub.id);
  }, [mode, presetSubject, subjects, exams]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!subjectId)       { alert("Pick a category, subcategory, and subject first."); return; }
    if (!text.trim())     { alert("Question text is required."); return; }
    const cleanOptions = options.filter((o) => o.text.trim() !== "");
    if (cleanOptions.length < 2)                       { alert("Add at least two answer options."); return; }
    if (!cleanOptions.some((o) => o.is_correct))       { alert("Mark which option is the correct answer."); return; }

    const payload = {
      subject_id: Number(subjectId),
      text: text.trim(),
      explanation: explanation.trim() || undefined,
      difficulty_level: difficulty,
      options: cleanOptions,
    };
    if (mode === "create") createQuestion(payload);
    else if (initial)      updateQuestion(initial.id, payload);
    router.push("/admin/questions");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field label="Category" required>
          <Select
            value={categoryId ? String(categoryId) : ""}
            onValueChange={(v) => { setCategoryId(v ? Number(v) : ""); setSubcategoryId(""); setSubjectId(""); }}
          >
            <SelectTrigger className="w-full bg-slate-50 dark:bg-zinc-800 text-sm">
              <SelectValue placeholder={categories.length === 0 ? "Create a category first" : "Select category"} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Subcategory" required>
          <Select
            value={subcategoryId ? String(subcategoryId) : ""}
            onValueChange={(v) => { setSubcategoryId(v ? Number(v) : ""); setSubjectId(""); }}
            disabled={!categoryId}
          >
            <SelectTrigger className="w-full bg-slate-50 dark:bg-zinc-800 text-sm">
              <SelectValue
                placeholder={
                  !categoryId ? "Pick a category first"
                  : subcategoryOptions.length === 0 ? "No subcategories — create one"
                  : "Select subcategory"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {subcategoryOptions.map((e) => (
                <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Subject / Course" required>
          <Select
            value={subjectId ? String(subjectId) : ""}
            onValueChange={(v) => setSubjectId(v ? Number(v) : "")}
            disabled={!subcategoryId}
          >
            <SelectTrigger className="w-full bg-slate-50 dark:bg-zinc-800 text-sm">
              <SelectValue
                placeholder={
                  !subcategoryId ? "Pick a subcategory first"
                  : subjectOptions.length === 0 ? "No subjects — add one to the subcategory"
                  : "Select subject"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {subjectOptions.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Question" required>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          required
          placeholder="Type the question prompt here…"
          className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948] resize-y"
        />
      </Field>

      <Field label="Answer options" hint="Up to four. Tick the correct answer.">
        <div className="space-y-2">
          {options.map((opt, idx) => (
            <div key={opt.key} className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-md bg-slate-100 dark:bg-zinc-800 grid place-items-center text-xs font-bold text-slate-600 dark:text-zinc-300 shrink-0">
                {opt.key}
              </span>
              <input
                value={opt.text}
                onChange={(e) => {
                  const next = [...options];
                  next[idx] = { ...opt, text: e.target.value };
                  setOptions(next);
                }}
                placeholder={`Option ${opt.key}`}
                className="flex-1 h-10 px-3 rounded-lg text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948]"
              />
              <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-zinc-300 cursor-pointer shrink-0 px-2">
                <input
                  type="radio"
                  name="correct-answer"
                  checked={opt.is_correct}
                  onChange={() => {
                    setOptions((cur) => cur.map((o, i) => ({ ...o, is_correct: i === idx })));
                  }}
                />
                Correct
              </label>
            </div>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Difficulty">
          <Select
            value={difficulty}
            onValueChange={(v) => setDifficulty(v as AdminQuestion["difficulty_level"])}
          >
            <SelectTrigger className="w-full bg-slate-50 dark:bg-zinc-800 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Beginner</SelectItem>
              <SelectItem value="medium">Intermediate</SelectItem>
              <SelectItem value="hard">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Explanation (optional)">
          <input
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Short note shown after the user answers."
            className="w-full h-10 px-3 rounded-lg text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948]"
          />
        </Field>
      </div>

      <div className="pt-1 flex items-center gap-2">
        <button
          type="submit"
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#F7C948] text-white hover:opacity-90 inline-flex items-center gap-1.5"
        >
          {mode === "create" ? <><Plus size={14} /> Create question</> : <><Check size={14} /> Save changes</>}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/questions")}
          className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label, hint, required, children,
}: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-slate-400 dark:text-zinc-500">{hint}</p>}
    </div>
  );
}
