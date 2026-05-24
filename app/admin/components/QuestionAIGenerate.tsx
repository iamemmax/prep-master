"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Wand2, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/Spinner";
import { useAdminStore, AdminQuestion } from "../util/store";

type Draft = Omit<AdminQuestion, "id">;

function mockGenerate(prompt: string, count: number, subjectId: number, difficulty: AdminQuestion["difficulty_level"]): Draft[] {
  // Returns plausibly-shaped questions so the UI is fully exercise-able
  // before the AI endpoint is wired up. Replace this with an API call.
  const seed = prompt.split(/[\s,.;]+/).find((w) => w.length > 2) ?? "topic";
  return Array.from({ length: count }, (_, i) => ({
    subject_id: subjectId,
    text: `Which of the following best describes "${seed}" — variant ${i + 1}?`,
    difficulty_level: difficulty,
    explanation: `Auto-generated explanation referencing "${seed}". Review before publishing.`,
    options: [
      { key: "A", text: `An accurate description of ${seed}`,         is_correct: i % 4 === 0 },
      { key: "B", text: `A common misconception about ${seed}`,       is_correct: i % 4 === 1 },
      { key: "C", text: `An unrelated concept`,                       is_correct: i % 4 === 2 },
      { key: "D", text: `A near-miss explanation of ${seed}`,         is_correct: i % 4 === 3 },
    ],
  }));
}

export default function QuestionAIGenerate() {
  const router = useRouter();
  const categories = useAdminStore((s) => s.categories);
  const exams      = useAdminStore((s) => s.exams);
  const subjects   = useAdminStore((s) => s.subjects);
  const bulkCreate = useAdminStore((s) => s.bulkCreateQuestions);

  const [categoryId, setCategoryId]       = useState<number | "">("");
  const [subcategoryId, setSubcategoryId] = useState<number | "">("");
  const [subjectId, setSubjectId]         = useState<number | "">("");
  const [prompt, setPrompt]               = useState("");
  const [count, setCount]                 = useState(5);
  const [difficulty, setDifficulty]       = useState<AdminQuestion["difficulty_level"]>("medium");
  const [busy, setBusy]                   = useState(false);
  const [drafts, setDrafts]               = useState<Draft[] | null>(null);

  const subcategoryOptions = useMemo(
    () => (categoryId ? exams.filter((e) => e.category_id === categoryId) : []),
    [exams, categoryId],
  );
  const subjectOptions = useMemo(
    () => (subcategoryId ? subjects.filter((s) => s.exam_id === subcategoryId) : []),
    [subjects, subcategoryId],
  );

  const onGenerate = async () => {
    if (!subjectId) { alert("Pick a category, subcategory, and subject first."); return; }
    if (!prompt.trim()) { alert("Describe what kind of questions to generate."); return; }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900)); // mimic a real call
    setDrafts(mockGenerate(prompt, count, Number(subjectId), difficulty));
    setBusy(false);
  };

  const commit = () => {
    if (!drafts || drafts.length === 0) return;
    const saved = bulkCreate(drafts);
    alert(`Saved ${saved} AI-generated question${saved === 1 ? "" : "s"}.`);
    router.push("/admin/questions");
  };

  const removeDraft = (idx: number) => {
    if (!drafts) return;
    setDrafts(drafts.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-amber-50/60 dark:bg-amber-500/10 border border-amber-200/70 dark:border-amber-500/30 px-4 py-3 text-[12px] text-[#894B00] dark:text-amber-200 flex items-start gap-2">
        <Sparkles size={14} className="mt-0.5 shrink-0" />
        <p>
          Drafts are AI-generated and need a human review before they go live. The current build uses a local mock generator;
          wire <code className="text-[11px] bg-amber-100/60 dark:bg-amber-500/20 px-1 rounded">mockGenerate()</code> to your AI endpoint when ready.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <FormField label="Category" required>
          <Select
            value={categoryId ? String(categoryId) : ""}
            onValueChange={(v) => { setCategoryId(v ? Number(v) : ""); setSubcategoryId(""); setSubjectId(""); }}
          >
            <SelectTrigger className="w-full bg-slate-50 dark:bg-zinc-800 text-sm">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Subcategory" required>
          <Select
            value={subcategoryId ? String(subcategoryId) : ""}
            onValueChange={(v) => { setSubcategoryId(v ? Number(v) : ""); setSubjectId(""); }}
            disabled={!categoryId}
          >
            <SelectTrigger className="w-full bg-slate-50 dark:bg-zinc-800 text-sm">
              <SelectValue placeholder={!categoryId ? "Pick a category first" : "Select subcategory"} />
            </SelectTrigger>
            <SelectContent>
              {subcategoryOptions.map((e) => (
                <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Subject / Course" required>
          <Select
            value={subjectId ? String(subjectId) : ""}
            onValueChange={(v) => setSubjectId(v ? Number(v) : "")}
            disabled={!subcategoryId}
          >
            <SelectTrigger className="w-full bg-slate-50 dark:bg-zinc-800 text-sm">
              <SelectValue placeholder={!subcategoryId ? "Pick a subcategory first" : "Select subject"} />
            </SelectTrigger>
            <SelectContent>
              {subjectOptions.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField label="Prompt" required hint="Describe the topic, syllabus, or focus area. Add any constraints (e.g. 'past WAEC style', 'no calculus').">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948] resize-y"
          placeholder="e.g. Generate questions on Newton's three laws of motion at WAEC physics difficulty, with worked-out explanations."
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="How many questions">
          <Select value={String(count)} onValueChange={(v) => setCount(Number(v))}>
            <SelectTrigger className="w-full bg-slate-50 dark:bg-zinc-800 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[3, 5, 10, 15, 20].map((n) => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Difficulty">
          <Select value={difficulty} onValueChange={(v) => setDifficulty(v as AdminQuestion["difficulty_level"])}>
            <SelectTrigger className="w-full bg-slate-50 dark:bg-zinc-800 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Beginner</SelectItem>
              <SelectItem value="medium">Intermediate</SelectItem>
              <SelectItem value="hard">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={busy}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#F7C948] text-white hover:opacity-90 inline-flex items-center gap-1.5 disabled:opacity-60"
        >
          {busy ? <>Generating <Spinner /></> : <><Wand2 size={14} /> Generate drafts</>}
        </button>
        {drafts && drafts.length > 0 && (
          <button
            type="button"
            onClick={commit}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 inline-flex items-center gap-1.5"
          >
            <CheckCircle2 size={14} /> Save {drafts.length} {drafts.length === 1 ? "question" : "questions"}
          </button>
        )}
      </div>

      {drafts && (
        <ul className="rounded-xl border border-slate-200 dark:border-zinc-800 divide-y divide-slate-100 dark:divide-zinc-800">
          {drafts.length === 0 && (
            <li className="px-4 py-6 text-sm text-slate-400 text-center">All drafts discarded.</li>
          )}
          {drafts.map((d, idx) => {
            const correct = d.options.find((o) => o.is_correct);
            return (
              <li key={idx} className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{d.text}</p>
                    <ul className="mt-1.5 space-y-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                      {d.options.map((o) => (
                        <li key={o.key} className={o.is_correct ? "text-emerald-700 dark:text-emerald-400 font-semibold" : ""}>
                          {o.key}. {o.text}{o.is_correct ? "  ✓" : ""}
                        </li>
                      ))}
                    </ul>
                    {correct && d.explanation && (
                      <p className="mt-1 text-[11px] italic text-slate-400">{d.explanation}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDraft(idx)}
                    className="text-xs text-slate-500 hover:text-rose-600 shrink-0"
                  >
                    Discard
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FormField({
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
