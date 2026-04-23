import { jsPDF } from "jspdf";

export type IncidentSeverity = "warn" | "alert";
export type IncidentKind = "phone" | "multi_person" | "no_face" | "face_hidden" | "device" | "object";

export interface StoredIncident {
  id: number;
  kind: IncidentKind;
  label: string;
  severity: IncidentSeverity;
  atIso: string;
  offsetSec: number;
  screenshot?: string;
}

export interface StoredProctorReport {
  id: string;
  sessionId: string | number;
  examType: string;
  sessionMode: string;
  difficulty: string;
  totalQuestions: number;
  score?: number;
  correctAnswers?: number;
  startedAtIso: string;
  endedAtIso: string;
  durationSec: number;
  incidents: StoredIncident[];
  createdAt: number;
}

const STORAGE_KEY = "prep:proctor_reports";
const MAX_SCREENSHOTS_PER_REPORT = 30;
const MAX_REPORTS = 50;

export function captureVideoFrame(
  video: HTMLVideoElement,
  maxW = 640,
  maxH = 480,
  quality = 0.72,
): string | undefined {
  if (!video || video.readyState < 2 || video.videoWidth === 0) return undefined;
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const scale = Math.min(maxW / vw, maxH / vh, 1);
  const w = Math.round(vw * scale);
  const h = Math.round(vh * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return undefined;
  try {
    ctx.drawImage(video, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } catch {
    return undefined;
  }
}

export function saveProctorReport(report: StoredProctorReport): void {
  if (typeof window === "undefined") return;
  const trimmed: StoredProctorReport = {
    ...report,
    incidents: report.incidents.slice(0, MAX_SCREENSHOTS_PER_REPORT * 2).map((inc, i) => ({
      ...inc,
      screenshot: i < MAX_SCREENSHOTS_PER_REPORT ? inc.screenshot : undefined,
    })),
  };
  try {
    const existing = listProctorReports();
    const next = [trimmed, ...existing.filter(r => r.id !== trimmed.id)].slice(0, MAX_REPORTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    try {
      const existing = listProctorReports();
      const stripped: StoredProctorReport = {
        ...trimmed,
        incidents: trimmed.incidents.map(inc => ({ ...inc, screenshot: undefined })),
      };
      const next = [stripped, ...existing.filter(r => r.id !== stripped.id)].slice(0, MAX_REPORTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // last-ditch: drop silently
    }
  }
}

export function listProctorReports(): StoredProctorReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function deleteProctorReport(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const next = listProctorReports().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch { /* noop */ }
}

export function clearProctorReports(): void {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function severityLabel(s: IncidentSeverity): string {
  return s === "alert" ? "Alert" : "Warning";
}

function severityColor(s: IncidentSeverity): [number, number, number] {
  return s === "alert" ? [220, 38, 38] : [217, 119, 6];
}

export function buildProctorPDF(report: StoredProctorReport): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 40;
  let y = 48;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 43);
  doc.text("Proctoring Report", marginX, y);

  y += 8;
  doc.setDrawColor(247, 201, 72);
  doc.setLineWidth(2);
  doc.line(marginX, y, marginX + 60, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated ${new Date(report.createdAt).toLocaleString()}`, marginX, y);
  y += 24;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(marginX, y, pageW - marginX * 2, 110, 6, 6, "FD");

  const innerX = marginX + 14;
  const boxY = y + 20;
  const col2X = marginX + (pageW - marginX * 2) / 2 + 6;

  const rows: [string, string][] = [
    ["Exam", report.examType || "—"],
    ["Session mode", report.sessionMode || "—"],
    ["Difficulty", report.difficulty || "—"],
    ["Questions", String(report.totalQuestions)],
    ["Started", new Date(report.startedAtIso).toLocaleString()],
    ["Ended", new Date(report.endedAtIso).toLocaleString()],
    ["Duration", formatDuration(report.durationSec)],
    ["Session ID", String(report.sessionId)],
  ];
  if (typeof report.score === "number") {
    rows.push(["Score", `${report.score.toFixed(2)}%`]);
  }
  if (typeof report.correctAnswers === "number") {
    rows.push(["Correct", `${report.correctAnswers} / ${report.totalQuestions}`]);
  }

  doc.setFontSize(9);
  rows.forEach((row, i) => {
    const [label, val] = row;
    const x = i % 2 === 0 ? innerX : col2X;
    const rowY = boxY + Math.floor(i / 2) * 16;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(label, x, rowY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 43);
    doc.text(String(val), x + 84, rowY);
  });

  y += 130;

  const alerts   = report.incidents.filter(i => i.severity === "alert").length;
  const warnings = report.incidents.filter(i => i.severity === "warn").length;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 43);
  doc.text("Summary", marginX, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `${report.incidents.length} incident${report.incidents.length === 1 ? "" : "s"} recorded (${alerts} alert${alerts === 1 ? "" : "s"}, ${warnings} warning${warnings === 1 ? "" : "s"}).`,
    marginX,
    y,
  );
  y += 24;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 43);
  doc.text("Incidents", marginX, y);
  y += 16;

  if (report.incidents.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("No incidents recorded during this session.", marginX, y);
    return doc;
  }

  const contentW = pageW - marginX * 2;

  report.incidents.forEach((inc, idx) => {
    const hasShot = !!inc.screenshot;
    const blockH = hasShot ? 200 : 42;
    if (y + blockH > pageH - 48) {
      doc.addPage();
      y = 48;
    }

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(marginX, y, contentW, blockH, 6, 6, "FD");

    const [r, g, b] = severityColor(inc.severity);
    doc.setFillColor(r, g, b);
    doc.roundedRect(marginX, y, 4, blockH, 2, 2, "F");

    const textX = marginX + 14;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 43);
    doc.text(`#${idx + 1} · ${inc.label}`, textX, y + 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(r, g, b);
    doc.text(severityLabel(inc.severity).toUpperCase(), textX, y + 32);

    doc.setTextColor(100, 116, 139);
    const offsetMin = Math.floor(inc.offsetSec / 60);
    const offsetSec = inc.offsetSec % 60;
    const offsetLabel = `T+${offsetMin}:${offsetSec.toString().padStart(2, "0")}`;
    doc.text(
      `${new Date(inc.atIso).toLocaleString()} · ${offsetLabel}`,
      textX + 90,
      y + 32,
    );

    if (hasShot && inc.screenshot) {
      try {
        doc.addImage(inc.screenshot, "JPEG", textX, y + 42, 213, 150, undefined, "FAST");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("Snapshot at incident", textX + 223, y + 58);
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Kind: ${inc.kind}`,
          textX + 223,
          y + 72,
        );
      } catch {
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text("(Snapshot unavailable)", textX, y + 60);
      }
    }

    y += blockH + 8;
  });

  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${total}`, pageW - marginX, pageH - 20, { align: "right" });
    doc.text("PrepMaster · Proctoring Report", marginX, pageH - 20);
  }

  return doc;
}

export function proctorReportFilename(report: StoredProctorReport): string {
  const safeExam = (report.examType || "session").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const date = new Date(report.endedAtIso).toISOString().slice(0, 10);
  return `proctor-${safeExam}-${date}-${report.sessionId}.pdf`;
}

export function downloadProctorPDF(report: StoredProctorReport): void {
  const doc = buildProctorPDF(report);
  doc.save(proctorReportFilename(report));
}

export function openProctorPDF(report: StoredProctorReport): void {
  const doc = buildProctorPDF(report);
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) {
    // Popup blocked — fall back to same-tab navigation which still shows it inline.
    window.location.href = url;
    return;
  }
  // Release the blob URL after the new tab has had a chance to load it.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
