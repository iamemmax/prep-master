"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload, FileText, FileJson, FileType2, AlertTriangle, CheckCircle2,
  Download, Pencil, Trash2, Check, X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/Spinner";
import { useAdminStore, AdminQuestion } from "../util/store";
import {
  ParsedRow,
  ParseResult,
  SAMPLE_CSV,
  SAMPLE_JSON,
  SAMPLE_TEXT_FORMAT,
  parseCsv,
  parseJson,
  parsePdf,
  parseDocx,
  downloadCsvSample,
  downloadJsonSample,
  downloadPdfSample,
  downloadDocxSample,
} from "../util/questionFileParsers";

type Format = "csv" | "json" | "pdf" | "word";

interface DraftRow extends ParsedRow {
  _localId: number;
}

const FORMAT_META: Record<Format, { accept: string; ext: string; binary: boolean }> = {
  csv:  { accept: ".csv,text/csv",                                                            ext: ".csv",  binary: false },
  json: { accept: ".json,application/json",                                                   ext: ".json", binary: false },
  pdf:  { accept: ".pdf,application/pdf",                                                     ext: ".pdf",  binary: true  },
  word: { accept: ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document", ext: ".docx", binary: true  },
};

let _localCounter = 1;
function attachIds(rows: ParsedRow[]): DraftRow[] {
  return rows.map((r) => ({ ...r, _localId: _localCounter++ }));
}

export default function QuestionBulkUpload() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const categories = useAdminStore((s) => s.categories);
  const exams      = useAdminStore((s) => s.exams);
  const subjects   = useAdminStore((s) => s.subjects);
  const bulkCreate = useAdminStore((s) => s.bulkCreateQuestions);

  const [categoryId, setCategoryId]       = useState<number | "">("");
  const [subcategoryId, setSubcategoryId] = useState<number | "">("");
  const [subjectId, setSubjectId]         = useState<number | "">("");
  const [format, setFormat]               = useState<Format>("csv");
  const [rawText, setRawText]             = useState("");
  const [fileName, setFileName]           = useState<string | null>(null);
  const [drafts, setDrafts]               = useState<DraftRow[]>([]);
  const [errors, setErrors]               = useState<{ line: number; reason: string }[]>([]);
  const [busy, setBusy]                   = useState(false);
  const [downloading, setDownloading]     = useState(false);
  const [editingId, setEditingId]         = useState<number | null>(null);

  const subcategoryOptions = useMemo(
    () => (categoryId ? exams.filter((e) => e.category_id === categoryId) : []),
    [exams, categoryId],
  );
  const subjectOptions = useMemo(
    () => (subcategoryId ? subjects.filter((s) => s.exam_id === subcategoryId) : []),
    [subjects, subcategoryId],
  );

  const isBinary = FORMAT_META[format].binary;
  const hasDrafts = drafts.length > 0;

  const applyResult = (result: ParseResult) => {
    setDrafts(attachIds(result.ok));
    setErrors(result.errors);
  };

  const onFile = async (file: File) => {
    setFileName(file.name);
    setDrafts([]);
    setErrors([]);
    setBusy(true);
    try {
      if (format === "csv") {
        const text = await file.text();
        setRawText(text);
        applyResult(parseCsv(text));
      } else if (format === "json") {
        const text = await file.text();
        setRawText(text);
        applyResult(parseJson(text));
      } else if (format === "pdf") {
        setRawText("");
        applyResult(await parsePdf(file));
      } else if (format === "word") {
        setRawText("");
        applyResult(await parseDocx(file));
      }
    } catch (e) {
      const reason = e instanceof Error ? e.message : "Could not read file.";
      setErrors([{ line: 0, reason }]);
    } finally {
      setBusy(false);
    }
  };

  const runPreviewFromText = () => {
    if (!rawText.trim()) return;
    applyResult(format === "json" ? parseJson(rawText) : parseCsv(rawText));
  };

  const insertSample = () => {
    if (format === "csv")  { setRawText(SAMPLE_CSV);  applyResult(parseCsv(SAMPLE_CSV)); }
    if (format === "json") { setRawText(SAMPLE_JSON); applyResult(parseJson(SAMPLE_JSON)); }
  };

  const handleDownloadSample = async () => {
    setDownloading(true);
    try {
      if (format === "csv")  downloadCsvSample();
      if (format === "json") downloadJsonSample();
      if (format === "pdf")  await downloadPdfSample();
      if (format === "word") await downloadDocxSample();
    } catch (e) {
      setErrors([{ line: 0, reason: `Could not build the sample file: ${(e as Error).message}` }]);
    } finally {
      setDownloading(false);
    }
  };

  const removeDraft = (id: number) => setDrafts((d) => d.filter((r) => r._localId !== id));

  const updateDraft = (id: number, patch: Partial<ParsedRow>) =>
    setDrafts((d) => d.map((r) => (r._localId === id ? { ...r, ...patch } : r)));

  const canImport = hasDrafts && !!subjectId;

  const commit = () => {
    if (!subjectId) { setErrors((e) => [{ line: 0, reason: "Pick a category, subcategory, and subject before importing." }, ...e]); return; }
    if (!hasDrafts) return;
    const rows = drafts.map((d) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _localId, ...row } = d;
      return { ...row, subject_id: Number(subjectId) };
    });
    const count = bulkCreate(rows);
    alert(`Imported ${count} question${count === 1 ? "" : "s"}.`);
    router.push("/admin/questions");
  };

  return (
    <div className="space-y-5">
      {/* Hierarchy — needed at commit time, not at parse time */}
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

      {/* Format picker + Download sample */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
          <FormatChip active={format === "csv"}  onClick={() => { setFormat("csv");  resetInputs(); }} icon={<FileText size={16} />}  label="CSV"  />
          <FormatChip active={format === "json"} onClick={() => { setFormat("json"); resetInputs(); }} icon={<FileJson size={16} />}  label="JSON" />
          <FormatChip active={format === "pdf"}  onClick={() => { setFormat("pdf");  resetInputs(); }} icon={<FileType2 size={16} />} label="PDF"  />
          <FormatChip active={format === "word"} onClick={() => { setFormat("word"); resetInputs(); }} icon={<FileType2 size={16} />} label="Word" />
        </div>
        <button
          type="button"
          onClick={handleDownloadSample}
          disabled={downloading}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-60 shrink-0"
        >
          {downloading ? <>Preparing <Spinner /></> : <><Download size={13} /> Download sample {format.toUpperCase()}</>}
        </button>
      </div>

      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
        className="rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-950/40 p-6 text-center"
      >
        <Upload size={20} className="mx-auto text-slate-400" />
        <p className="mt-2 text-sm font-semibold">
          Drop a {FORMAT_META[format].ext} file or choose one
        </p>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
          {format === "csv"  && "Comma-separated with columns: question, option_a..d, correct, difficulty, explanation"}
          {format === "json" && "Array of question objects with `text`, `options[]`, `difficulty`, `explanation`"}
          {(format === "pdf" || format === "word") && "Use the sample as a template — one question per block, separated by a blank line"}
        </p>
        <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
          <input
            ref={fileRef}
            type="file"
            accept={FORMAT_META[format].accept}
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              if (e.target) e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 disabled:opacity-60"
          >
            Choose {format.toUpperCase()} file
          </button>
          {!isBinary && (
            <button
              type="button"
              onClick={insertSample}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800"
            >
              Insert sample inline
            </button>
          )}
          {fileName && (
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-xs">
              {busy ? "Parsing…" : `Loaded: ${fileName}`}
            </span>
          )}
        </div>
      </div>

      {/* CSV/JSON textarea */}
      {!isBinary && (
        <>
          <FormField label={`Or paste ${format.toUpperCase()} contents`}>
            <textarea
              value={rawText}
              onChange={(e) => { setRawText(e.target.value); setDrafts([]); setErrors([]); }}
              rows={8}
              spellCheck={false}
              className="w-full px-3 py-2 rounded-lg text-xs font-mono bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948] resize-y"
              placeholder={format === "csv" ? SAMPLE_CSV : SAMPLE_JSON}
            />
          </FormField>
          <div>
            <button
              type="button"
              onClick={runPreviewFromText}
              disabled={busy || !rawText.trim()}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#F7C948] text-white hover:opacity-90 disabled:opacity-60"
            >
              Preview pasted text
            </button>
          </div>
        </>
      )}

      {/* PDF / Word layout hint */}
      {isBinary && (
        <details className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-950/40 px-4 py-3">
          <summary className="text-xs font-semibold cursor-pointer text-slate-700 dark:text-zinc-300">
            Expected layout inside the {format === "pdf" ? "PDF" : "Word"} file
          </summary>
          <pre className="mt-2 text-[11px] font-mono whitespace-pre-wrap text-slate-500 dark:text-zinc-400">
{SAMPLE_TEXT_FORMAT}
          </pre>
        </details>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/60 dark:bg-rose-500/10 px-4 py-3">
          <p className="text-xs font-bold inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
            <AlertTriangle size={14} /> {errors.length} issue{errors.length === 1 ? "" : "s"} while parsing
          </p>
          <ul className="mt-2 space-y-1 max-h-48 overflow-y-auto text-[11px] text-rose-700/80 dark:text-rose-200/80">
            {errors.slice(0, 50).map((er, i) => (
              <li key={i}>• Block/Line {er.line}: {er.reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Parsed drafts — editable */}
      {hasDrafts && (
        <section>
          <header className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 size={14} /> {drafts.length} parsed and ready to import
            </p>
            <button
              type="button"
              onClick={() => { setDrafts([]); setErrors([]); }}
              className="text-xs text-slate-500 hover:text-rose-600"
            >
              Discard all
            </button>
          </header>

          <ul className="rounded-xl border border-slate-200 dark:border-zinc-800 divide-y divide-slate-100 dark:divide-zinc-800">
            {drafts.map((d) => (
              <DraftCard
                key={d._localId}
                draft={d}
                isEditing={editingId === d._localId}
                onEdit={() => setEditingId(d._localId)}
                onCancelEdit={() => setEditingId(null)}
                onSave={(patch) => { updateDraft(d._localId, patch); setEditingId(null); }}
                onRemove={() => removeDraft(d._localId)}
              />
            ))}
          </ul>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={commit}
              disabled={!canImport}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import {drafts.length} {drafts.length === 1 ? "question" : "questions"}
            </button>
            {!subjectId && (
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                Pick a subject above to enable import.
              </span>
            )}
          </div>
        </section>
      )}
    </div>
  );

  function resetInputs() {
    setRawText("");
    setFileName(null);
    setDrafts([]);
    setErrors([]);
    setEditingId(null);
  }
}

// ─── Draft card (view + edit) ────────────────────────────────────────────────

function DraftCard({
  draft, isEditing, onEdit, onCancelEdit, onSave, onRemove,
}: {
  draft: ParsedRow;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (patch: Partial<ParsedRow>) => void;
  onRemove: () => void;
}) {
  // View mode
  if (!isEditing) {
    const correct = draft.options.find((o) => o.is_correct);
    return (
      <li className="px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{draft.text}</p>
            <ul className="mt-1.5 space-y-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
              {draft.options.map((o) => (
                <li key={o.key} className={o.is_correct ? "text-emerald-700 dark:text-emerald-400 font-semibold" : ""}>
                  {o.key}. {o.text}{o.is_correct ? "  ✓" : ""}
                </li>
              ))}
            </ul>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
              {difficultyLabel(draft.difficulty_level)}{correct ? "" : " · ⚠ no correct answer"}
              {draft.explanation ? ` · ${draft.explanation}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onEdit} className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-zinc-300 hover:text-[#F7C948]">
              <Pencil size={12} /> Edit
            </button>
            <button onClick={onRemove} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600">
              <Trash2 size={12} /> Remove
            </button>
          </div>
        </div>
      </li>
    );
  }

  // Edit mode
  return (
    <li className="px-4 py-3 bg-slate-50/60 dark:bg-zinc-950/40">
      <DraftEditor
        initial={draft}
        onCancel={onCancelEdit}
        onSave={onSave}
      />
    </li>
  );
}

function DraftEditor({
  initial, onCancel, onSave,
}: {
  initial: ParsedRow;
  onCancel: () => void;
  onSave: (patch: Partial<ParsedRow>) => void;
}) {
  const [text, setText]               = useState(initial.text);
  const [difficulty, setDifficulty]   = useState<AdminQuestion["difficulty_level"]>(initial.difficulty_level);
  const [explanation, setExplanation] = useState(initial.explanation ?? "");
  const [options, setOptions]         = useState(initial.options.map((o) => ({ ...o })));

  const save = () => {
    const cleanOptions = options.filter((o) => o.text.trim() !== "");
    if (cleanOptions.length < 2)                       { alert("Keep at least two answer options."); return; }
    if (!cleanOptions.some((o) => o.is_correct))       { alert("Mark which option is correct."); return; }
    if (!text.trim())                                  { alert("Question text is required."); return; }
    onSave({
      text: text.trim(),
      difficulty_level: difficulty,
      explanation: explanation.trim() || undefined,
      options: cleanOptions,
    });
  };

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 rounded-lg text-sm bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948] resize-y"
      />

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
              className="flex-1 h-9 px-3 rounded-lg text-sm bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948]"
            />
            <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-zinc-300 cursor-pointer shrink-0 px-2">
              <input
                type="radio"
                name={`correct-${initial.text.slice(0, 16)}`}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">Difficulty</label>
          <Select value={difficulty} onValueChange={(v) => setDifficulty(v as AdminQuestion["difficulty_level"])}>
            <SelectTrigger className="w-full bg-white dark:bg-zinc-800 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Beginner</SelectItem>
              <SelectItem value="medium">Intermediate</SelectItem>
              <SelectItem value="hard">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">Explanation (optional)</label>
          <input
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="w-full h-9 px-3 rounded-lg text-sm bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button onClick={save} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F7C948] text-white hover:opacity-90">
          <Check size={12} /> Save
        </button>
        <button onClick={onCancel} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800">
          <X size={12} /> Cancel
        </button>
      </div>
    </div>
  );
}

function difficultyLabel(d: string) {
  switch (d) {
    case "easy":   return "Beginner";
    case "medium": return "Intermediate";
    case "hard":   return "Advanced";
    default:       return d;
  }
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

function FormatChip({
  active, onClick, icon, label,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
        active
          ? "border-[#F7C948] bg-[#F7C948]/10 text-[#894B00]"
          : "border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
