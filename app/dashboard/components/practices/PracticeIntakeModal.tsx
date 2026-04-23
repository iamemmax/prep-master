"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Sparkles,
  X,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";

type Stage = "idle" | "uploading" | "analyzing" | "ready";

interface GeneratedQuestion {
  id: number;
  text: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  type: "MCQ" | "Short" | "True/False";
}

type ModalState = {
  file: File | null;
  previewUrl: string | null;
  stage: Stage;
  progress: number;
  stepIdx: number;
  questions: GeneratedQuestion[];
  selected: Set<number>;
  dragOver: boolean;
};

const INITIAL_STATE: ModalState = {
  file: null,
  previewUrl: null,
  stage: "idle",
  progress: 0,
  stepIdx: 0,
  questions: [],
  selected: new Set(),
  dragOver: false,
};

const MOCK_TOPICS = [
  "Thermodynamics", "Stoichiometry", "Kinetics", "Organic Chemistry",
  "Cell Biology", "Genetics", "Mechanics", "Electromagnetism",
];

const MOCK_QUESTIONS_TEXT = [
  "What is the first law of thermodynamics in a closed system?",
  "Calculate the limiting reagent when 5.0g of A reacts with 8.0g of B.",
  "Which catalyst would most accelerate the reaction described in the text?",
  "Describe the difference between activation energy and enthalpy change.",
  "Identify the functional group responsible for the observed reactivity.",
  "Predict the product of the SN2 reaction shown in the figure.",
  "What role does the mitochondrial membrane play in ATP synthesis?",
  "Given the Punnett square, what is the expected phenotypic ratio?",
];

const ANALYSIS_STEPS = [
  { label: "Extracting text & figures" },
  { label: "Identifying concepts" },
  { label: "Mapping to exam syllabus" },
  { label: "Generating questions" },
];

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function diffColor(d: GeneratedQuestion["difficulty"]) {
  if (d === "Easy") return "bg-emerald-50 text-emerald-600 border-emerald-200";
  if (d === "Medium") return "bg-amber-50 text-[#894B00] border-amber-200";
  return "bg-rose-50 text-rose-600 border-rose-200";
}

function generateMockQuestions(n: number): GeneratedQuestion[] {
  const difficulties: GeneratedQuestion["difficulty"][] = ["Easy", "Medium", "Hard"];
  const types: GeneratedQuestion["type"][] = ["MCQ", "Short", "True/False"];
  return Array.from({ length: n }).map((_, i) => ({
    id: i + 1,
    text: MOCK_QUESTIONS_TEXT[i % MOCK_QUESTIONS_TEXT.length],
    topic: MOCK_TOPICS[Math.floor(Math.random() * MOCK_TOPICS.length)],
    difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
    type: types[Math.floor(Math.random() * types.length)],
  }));
}

// Outer shell just handles the key-based remount reset
export default function PracticeIntakeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent
        className="bg-white dark:bg-zinc-900 border-none p-0 text-slate-900 dark:text-zinc-100"
        style={{ maxWidth: 720, zIndex: 9999 }}
        showCloseButton={false}
      >
        {/* key={open} remounts ModalInner when open flips false→true,
            resetting all state to INITIAL_STATE automatically */}
        <ModalInner key={String(open)} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}

function ModalInner({ onClose }: { onClose: () => void }) {
  const [s, setS] = useState<ModalState>(INITIAL_STATE);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // Holds the current object URL so we can revoke it on change
  const objectUrlRef = useRef<string | null>(null);

  function patch(partial: Partial<ModalState>) {
    setS(prev => ({ ...prev, ...partial }));
  }

  // Uploading progress ticker
  useEffect(() => {
    if (s.stage !== "uploading") return;
    const iv = setInterval(() => {
      setS(prev => {
        const next = prev.progress + Math.random() * 18 + 6;
        if (next >= 100) {
          clearInterval(iv);
          return { ...prev, progress: 100, stepIdx: 0, stage: "analyzing" };
        }
        return { ...prev, progress: next };
      });
    }, 200);
    return () => clearInterval(iv);
  }, [s.stage]);

  // Analysis steps ticker
  useEffect(() => {
    if (s.stage !== "analyzing") return;
    const steps = ANALYSIS_STEPS.length;
    const iv = setInterval(() => {
      setS(prev => {
        const next = prev.stepIdx + 1;
        if (next >= steps) {
          clearInterval(iv);
          const qs = generateMockQuestions(8);
          return {
            ...prev,
            stepIdx: next,
            questions: qs,
            selected: new Set(qs.map(q => q.id)),
            stage: "ready",
          };
        }
        return { ...prev, stepIdx: next };
      });
    }, 700);
    return () => clearInterval(iv);
  }, [s.stage]);

  const acceptFile = useCallback((f: File | null) => {
    if (!f) return;
    const okType =
      f.type.startsWith("image/") ||
      f.type === "application/pdf" ||
      /\.(pdf|png|jpe?g|webp|heic)$/i.test(f.name);
    if (!okType) return;

    // Revoke any previous object URL
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    // Build preview URL for images synchronously — no effect needed
    let previewUrl: string | null = null;
    if (f.type.startsWith("image/")) {
      previewUrl = URL.createObjectURL(f);
      objectUrlRef.current = previewUrl;
    }

    patch({ file: f, previewUrl, stage: "uploading", progress: 0 });
  }, []);

  // Revoke object URL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    patch({ dragOver: false });
    acceptFile(e.dataTransfer.files?.[0] ?? null);
  }

  function toggle(id: number) {
    setS(prev => {
      const n = new Set(prev.selected);
      if (n.has(id)) n.delete(id); else n.add(id);
      return { ...prev, selected: n };
    });
  }

  function resetForNewFile() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setS(INITIAL_STATE);
  }

  const { file, previewUrl, stage, progress, stepIdx, questions, selected, dragOver } = s;
  const isImage = file?.type.startsWith("image/");
  const selectedCount = selected.size;

  return (
    <div className="flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#FE9A00] to-[#FF6900] flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">AI Question Generator</h2>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              Upload a screenshot or PDF — we&apos;ll turn it into practice questions
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
        {/* Upload zone */}
        {stage === "idle" && (
          <>
            <div
              onDragOver={e => { e.preventDefault(); patch({ dragOver: true }); }}
              onDragLeave={() => patch({ dragOver: false })}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`cursor-pointer border-2 border-dashed rounded-2xl px-6 py-10 flex flex-col items-center justify-center gap-2 transition-colors ${
                dragOver
                  ? "border-[#F7C948] bg-[#FFF4DF]/50 dark:bg-amber-500/10"
                  : "border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/40 hover:border-[#F7C948] hover:bg-[#FFF4DF]/30 dark:hover:bg-amber-500/5"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-[#FFF4DF] flex items-center justify-center mb-1">
                <UploadCloud size={22} className="text-[#894B00]" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
                Drop a file here, or <span className="text-[#894B00] underline">browse</span>
              </p>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500">PDF, PNG, JPG, WEBP · max 20 MB</p>
              <input
                ref={inputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={e => acceptFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: <ImageIcon size={14} />, title: "Textbook page", sub: "Screenshot" },
                { icon: <FileText size={14} />, title: "Past exam", sub: "PDF" },
                { icon: <ImageIcon size={14} />, title: "Lecture slide", sub: "Screenshot" },
              ].map((item, i) => (
                <div key={i} className="rounded-xl border border-slate-200 dark:border-zinc-700 p-3 flex items-start gap-2">
                  <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-700 dark:text-zinc-200 leading-tight">{item.title}</p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Uploading / Analyzing */}
        {(stage === "uploading" || stage === "analyzing") && file && (
          <div className="flex flex-col gap-4">
            <FilePreview file={file} previewUrl={previewUrl} isImage={!!isImage} />

            {stage === "uploading" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-slate-700">Uploading…</p>
                  <p className="text-xs font-bold text-slate-700 tabular-nums">
                    {Math.min(100, Math.round(progress))}%
                  </p>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, progress)}%`, background: "#F7C948" }}
                  />
                </div>
              </div>
            )}

            {stage === "analyzing" && (
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                <p className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#894B00]" />
                  Analyzing your material
                </p>
                <ul className="space-y-2">
                  {ANALYSIS_STEPS.map((step, i) => {
                    const done = i < stepIdx;
                    const active = i === stepIdx;
                    return (
                      <li key={step.label} className="flex items-center gap-2">
                        <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                          {done && <CheckCircle2 size={14} className="text-emerald-500" />}
                          {active && <Loader2 size={14} className="text-[#894B00] animate-spin" />}
                          {!done && !active && <span className="w-2 h-2 rounded-full bg-slate-300" />}
                        </span>
                        <span className={`text-[11px] ${done ? "text-slate-500 line-through" : active ? "font-semibold text-slate-800" : "text-slate-400"}`}>
                          {step.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Ready */}
        {stage === "ready" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  {questions.length} questions generated
                </p>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                  Review, deselect any you don&apos;t want, then start practice
                </p>
              </div>
              <button
                onClick={resetForNewFile}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1 border border-slate-200 rounded-lg px-2.5 py-1.5"
              >
                <RefreshCw size={11} />
                Upload different file
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
              {questions.map(q => {
                const checked = selected.has(q.id);
                return (
                  <label
                    key={q.id}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(q.id)}
                      className="mt-1 accent-[#F7C948]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 leading-snug">{q.text}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {q.topic}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${diffColor(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          {q.type}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={stage !== "ready" || selectedCount === 0}
          onClick={onClose}
          className={`flex-1 h-11 rounded-xl flex items-center justify-center gap-x-2 text-sm font-bold text-white transition-all ${
            stage === "ready" && selectedCount > 0
              ? "hover:opacity-90 hover:-translate-y-0.5 cursor-pointer"
              : "opacity-50 cursor-not-allowed"
          }`}
          style={{ background: "linear-gradient(135deg, #FE9A00, #FF6900)" }}
        >
          {stage === "ready"
            ? `Start practice with ${selectedCount} question${selectedCount === 1 ? "" : "s"}`
            : "Start practice"}
        </button>
      </div>
    </div>
  );
}

function FilePreview({
  file,
  previewUrl,
  isImage,
}: {
  file: File;
  previewUrl: string | null;
  isImage: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-zinc-700 p-3">
      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
        {isImage && previewUrl ? (
          <Image
            src={previewUrl}
            alt={file.name}
            fill
            sizes="56px"
            unoptimized
            className="object-cover"
          />
        ) : (
          <FileText size={22} className="text-slate-400 dark:text-zinc-500" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-700 truncate">{file.name}</p>
        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
          {formatBytes(file.size)} · {isImage ? "Image" : "PDF"}
        </p>
      </div>
    </div>
  );
}