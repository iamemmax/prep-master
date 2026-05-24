// Client-side parsers and sample-file generators for the question bulk
// upload. PDF (pdfjs-dist) and Word (mammoth) are loaded with dynamic
// imports so they only ship when the user actually picks those tabs.

import type { AdminQuestion } from "./store";

// Parsed rows don't carry a subject_id — the user picks the target subject
// at import time, so the parsers stay pure and reusable.
export type ParsedRow = Omit<AdminQuestion, "id" | "subject_id">;
export type ParseResult = { ok: ParsedRow[]; errors: { line: number; reason: string }[] };

// ─── Common text format used by PDF and Word ────────────────────────────────
//
// 1. What is 2 + 2?
// A) 1
// B) 2
// C) 3
// D) 4
// Answer: D
// Difficulty: easy        (optional)
// Explanation: Basic.     (optional)
//
// Blocks are separated by one or more blank lines.

export const SAMPLE_TEXT_FORMAT =
`1. What is 2 + 2?
A) 1
B) 2
C) 3
D) 4
Answer: D
Difficulty: easy
Explanation: Basic addition.

2. Which city is the capital of France?
A) Berlin
B) Paris
C) Rome
D) Madrid
Answer: B
Difficulty: easy
Explanation: Paris is the capital of France.`;

export const SAMPLE_CSV =
`question,option_a,option_b,option_c,option_d,correct,difficulty,explanation
What is 2 + 2?,1,2,3,4,D,easy,Basic addition.
Capital of France?,Berlin,Paris,Rome,Madrid,B,easy,Paris is the capital of France.`;

export const SAMPLE_JSON = JSON.stringify(
  [
    {
      text: "What is 2 + 2?",
      difficulty: "easy",
      explanation: "Basic addition.",
      options: [
        { key: "A", text: "1", is_correct: false },
        { key: "B", text: "2", is_correct: false },
        { key: "C", text: "3", is_correct: false },
        { key: "D", text: "4", is_correct: true  },
      ],
    },
    {
      text: "Which city is the capital of France?",
      difficulty: "easy",
      explanation: "Paris is the capital of France.",
      options: [
        { key: "A", text: "Berlin", is_correct: false },
        { key: "B", text: "Paris",  is_correct: true  },
        { key: "C", text: "Rome",   is_correct: false },
        { key: "D", text: "Madrid", is_correct: false },
      ],
    },
  ],
  null,
  2,
);

export function normalizeDifficulty(d: string | undefined): AdminQuestion["difficulty_level"] {
  const v = (d ?? "").toLowerCase().trim();
  if (["easy", "beginner", "1"].includes(v)) return "easy";
  if (["hard", "advanced", "3"].includes(v)) return "hard";
  return "medium";
}

// ─── CSV ────────────────────────────────────────────────────────────────────

function splitCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else cur += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cur); cur = "";
        rows.push(row); row = [];
      } else cur += c;
    }
  }
  if (cur !== "" || row.length > 0) { row.push(cur); rows.push(row); }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

export function parseCsv(text: string): ParseResult {
  const rows = splitCsv(text);
  if (rows.length < 2) return { ok: [], errors: [{ line: 1, reason: "Empty file or only a header row." }] };
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);
  const required = ["question", "option_a", "option_b", "correct"];
  const missing = required.filter((r) => col(r) === -1);
  if (missing.length > 0) {
    return {
      ok: [],
      errors: [{
        line: 1,
        reason: `Missing required column(s): ${missing.join(", ")}. Header found: ${header.join(", ")}`,
      }],
    };
  }

  const ok: ParsedRow[] = [];
  const errors: { line: number; reason: string }[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const get = (key: string) => (col(key) >= 0 ? (r[col(key)] ?? "").trim() : "");
    const question = get("question");
    if (!question) { errors.push({ line: i + 1, reason: "Empty question" }); continue; }

    const rawOptions = (["a", "b", "c", "d"] as const).map((k) => ({ key: k.toUpperCase(), text: get(`option_${k}`) }));
    const filled = rawOptions.filter((o) => o.text !== "");
    if (filled.length < 2) { errors.push({ line: i + 1, reason: "At least two non-empty options required" }); continue; }

    const correctRaw = get("correct").toUpperCase();
    if (!["A", "B", "C", "D"].includes(correctRaw)) {
      errors.push({ line: i + 1, reason: `Invalid correct answer "${correctRaw}". Must be A/B/C/D.` });
      continue;
    }
    if (!filled.find((o) => o.key === correctRaw)) {
      errors.push({ line: i + 1, reason: `Correct answer "${correctRaw}" points to an empty option.` });
      continue;
    }

    ok.push({
      text: question,
      difficulty_level: normalizeDifficulty(get("difficulty")),
      explanation: get("explanation") || undefined,
      options: filled.map((o) => ({ ...o, is_correct: o.key === correctRaw })),
    });
  }

  return { ok, errors };
}

// ─── JSON ───────────────────────────────────────────────────────────────────

export function parseJson(text: string): ParseResult {
  let arr: unknown;
  try { arr = JSON.parse(text); }
  catch (e) { return { ok: [], errors: [{ line: 0, reason: `Invalid JSON: ${(e as Error).message}` }] }; }
  if (!Array.isArray(arr)) return { ok: [], errors: [{ line: 0, reason: "Expected a JSON array at the top level." }] };

  const ok: ParsedRow[] = [];
  const errors: { line: number; reason: string }[] = [];

  arr.forEach((raw, idx) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = raw as any;
    if (!r || typeof r.text !== "string" || !r.text.trim()) {
      errors.push({ line: idx + 1, reason: "Missing or empty `text`" }); return;
    }
    if (!Array.isArray(r.options) || r.options.length < 2) {
      errors.push({ line: idx + 1, reason: "Needs an `options` array with at least two items" }); return;
    }
    const opts = r.options
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((o: any, i: number) => ({
        key: typeof o.key === "string" && o.key ? String(o.key).toUpperCase() : String.fromCharCode(65 + i),
        text: typeof o.text === "string" ? o.text : "",
        is_correct: !!o.is_correct,
      }))
      .filter((o: { text: string }) => o.text.trim() !== "");
    if (opts.length < 2) {
      errors.push({ line: idx + 1, reason: "Fewer than two non-empty options after cleaning" }); return;
    }
    if (!opts.some((o: { is_correct: boolean }) => o.is_correct)) {
      errors.push({ line: idx + 1, reason: "No option marked is_correct: true" }); return;
    }
    ok.push({
      text: r.text.trim(),
      difficulty_level: normalizeDifficulty(r.difficulty ?? r.difficulty_level),
      explanation: typeof r.explanation === "string" ? r.explanation : undefined,
      options: opts,
    });
  });

  return { ok, errors };
}

// ─── Shared text parser (used by PDF + Word) ────────────────────────────────
//
// Question boundaries are detected by the start pattern `1.`, `1)`, or `Q:`
// at the start of a line — *not* by blank lines. That makes the parser
// resilient to PDF/Word extraction quirks that drop or duplicate line breaks.

const QUESTION_START_RE = /^\s*(?:Q\s*[:.\-]\s*|(\d+)[.)]\s+)(.*)$/i;
const OPTION_RE         = /^\s*([A-D])\s*[).\-:]\s*(.+)$/i;
const ANSWER_RE         = /^\s*(?:Answer|Ans|Correct)\s*[:.\-]\s*([A-D])\b/i;
const DIFFICULTY_RE     = /^\s*Difficulty\s*[:.\-]\s*(.+)$/i;
const EXPLANATION_RE    = /^\s*Explanation\s*[:.\-]\s*(.+)$/i;

interface InProgress {
  startedAt: number; // 1-based line index where the question started
  text: string;
  options: { key: string; text: string }[];
  correctKey: string;
  difficulty?: string;
  explanation?: string;
}

function emptyQ(startedAt: number): InProgress {
  return { startedAt, text: "", options: [], correctKey: "" };
}

function commitQuestion(q: InProgress, ok: ParsedRow[], errors: { line: number; reason: string }[]) {
  if (!q.text && q.options.length === 0 && !q.correctKey) return; // nothing to commit
  if (!q.text) {
    errors.push({ line: q.startedAt, reason: "No question text found" }); return;
  }
  if (q.options.length < 2) {
    errors.push({ line: q.startedAt, reason: "Need at least two A)–D) options" }); return;
  }
  if (!q.correctKey) {
    errors.push({ line: q.startedAt, reason: "Missing `Answer: A/B/C/D` line" }); return;
  }
  if (!q.options.find((o) => o.key === q.correctKey)) {
    errors.push({ line: q.startedAt, reason: `Answer "${q.correctKey}" not in the provided options` }); return;
  }
  ok.push({
    text: q.text,
    difficulty_level: normalizeDifficulty(q.difficulty),
    explanation: q.explanation,
    options: q.options.map((o) => ({ ...o, is_correct: o.key === q.correctKey })),
  });
}

export function parseTextBlocks(text: string): ParseResult {
  const lines = text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.trim());

  const ok: ParsedRow[] = [];
  const errors: { line: number; reason: string }[] = [];
  let current: InProgress | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const qMatch    = line.match(QUESTION_START_RE);
    const optMatch  = line.match(OPTION_RE);
    const ansMatch  = line.match(ANSWER_RE);
    const diffMatch = line.match(DIFFICULTY_RE);
    const explMatch = line.match(EXPLANATION_RE);

    if (qMatch) {
      // New question — flush the previous one first.
      if (current) commitQuestion(current, ok, errors);
      current = emptyQ(i + 1);
      current.text = (qMatch[2] ?? "").trim();
      continue;
    }

    if (!current) {
      // No question started yet — treat this line as the start of an
      // implicit first question so headerless files still work.
      current = emptyQ(i + 1);
      current.text = line;
      continue;
    }

    if (optMatch) {
      current.options.push({ key: optMatch[1].toUpperCase(), text: optMatch[2].trim() });
    } else if (ansMatch) {
      current.correctKey = ansMatch[1].toUpperCase();
    } else if (diffMatch) {
      current.difficulty = diffMatch[1].trim();
    } else if (explMatch) {
      current.explanation = explMatch[1].trim();
    } else if (current.options.length === 0) {
      // Continuation of the question prompt across multiple lines.
      current.text = current.text ? `${current.text} ${line}` : line;
    } else {
      // Continuation of the last option (PDFs sometimes wrap a long answer).
      const last = current.options[current.options.length - 1];
      last.text = `${last.text} ${line}`;
    }
  }

  if (current) commitQuestion(current, ok, errors);

  return { ok, errors };
}

// ─── PDF parser (uses pdfjs-dist, dynamic import) ───────────────────────────

export async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (pdfjs as any).GlobalWorkerOptions.workerSrc =
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // pdfjs returns each text run as an item with a transform matrix:
    //   transform = [scaleX, skewY, skewX, scaleY, x, y]
    // We bucket items by `y` (top-of-baseline) so wrapped items on the same
    // visual line collate into one string. Items are then emitted top-to-
    // bottom (PDF y=0 is the bottom of the page, so we sort descending).
    interface Row { y: number; items: { x: number; str: string }[] }
    const rows: Row[] = [];

    for (const item of content.items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const it = item as any;
      const str = String(it.str ?? "");
      if (!Array.isArray(it.transform)) continue;
      const x = it.transform[4];
      const y = it.transform[5];

      // Same line = within 2pt vertically. Tweak if your PDFs use very small
      // font sizes — the default in jspdf at 11pt gives ~12pt line height.
      let row = rows.find((r) => Math.abs(r.y - y) < 2);
      if (!row) { row = { y, items: [] }; rows.push(row); }
      row.items.push({ x, str });
    }

    // Top-to-bottom, then left-to-right within each row. Join items with a
    // space *only* when there's a real horizontal gap, otherwise text gets
    // doubled up (e.g. "What" + " is" already includes the space).
    rows.sort((a, b) => b.y - a.y);
    const lines = rows.map((row) => {
      row.items.sort((a, b) => a.x - b.x);
      let line = "";
      for (const it of row.items) line += it.str;
      return line.trimEnd();
    });

    // Insert blank lines when there's a noticeable vertical gap between
    // consecutive rows (helps the parser when authors leave breathing room
    // between questions). With 11pt body text in jsPDF, a one-line gap is
    // about 12–14pt, so anything above ~18pt is a paragraph break.
    let pageText = "";
    let prevY: number | null = null;
    for (let r = 0; r < rows.length; r++) {
      const y = rows[r].y;
      if (prevY !== null) {
        const gap = prevY - y;
        pageText += gap > 18 ? "\n\n" : "\n";
      }
      pageText += lines[r];
      prevY = y;
    }
    pages.push(pageText);
  }
  return pages.join("\n\n");
}

export async function parsePdf(file: File): Promise<ParseResult> {
  const text = await extractTextFromPdf(file);
  return parseTextBlocks(text);
}

// ─── Word (.docx) parser (uses mammoth, dynamic import) ─────────────────────

export async function extractTextFromDocx(file: File): Promise<string> {
  // Mammoth's package.json has a `browser` mapping that swaps the Node-only
  // unzip path for a browser-friendly one, so the plain "mammoth" import
  // resolves correctly in Next.js' bundling.
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export async function parseDocx(file: File): Promise<ParseResult> {
  const text = await extractTextFromDocx(file);
  return parseTextBlocks(text);
}

// ─── Sample file generators ────────────────────────────────────────────────

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCsvSample() {
  download(new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8" }), "questions-sample.csv");
}

export function downloadJsonSample() {
  download(new Blob([SAMPLE_JSON], { type: "application/json" }), "questions-sample.json");
}

export async function downloadPdfSample() {
  const jsPdfMod = await import("jspdf");
  const JsPdf = jsPdfMod.jsPDF ?? jsPdfMod.default;
  const doc = new JsPdf({ unit: "pt", format: "letter" });
  doc.setFont("Helvetica", "");
  doc.setFontSize(11);
  const margin = 54;
  const lines = doc.splitTextToSize(SAMPLE_TEXT_FORMAT, doc.internal.pageSize.getWidth() - margin * 2);
  doc.text(lines, margin, margin);
  doc.save("questions-sample.pdf");
}

export async function downloadDocxSample() {
  const { Document, Paragraph, Packer, TextRun } = await import("docx");
  const paragraphs = SAMPLE_TEXT_FORMAT.split("\n").map((line) =>
    new Paragraph({
      children: [new TextRun({ text: line })],
    }),
  );
  const doc = new Document({ sections: [{ children: paragraphs }] });
  const blob = await Packer.toBlob(doc);
  download(blob, "questions-sample.docx");
}
