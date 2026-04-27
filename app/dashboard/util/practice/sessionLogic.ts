import type { Question } from "@/app/dashboard/util/types/pratcie/StartPracticeTypes";

/** Format a non-negative second count into `M:SS` (e.g. 65 → "1:05"). */
export function formatTimer(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Classify how the user is pacing on the current question relative to the
 * target time per question:
 *   - ratio ≤ 1.2 → "ok"      (on pace or only slightly over)
 *   - 1.2 < ratio ≤ 2 → "warn" (lingering — about to fall behind)
 *   - ratio > 2 → "alert"      (way over — needs to move on)
 *
 * Returns "ok" if the target is non-positive (avoids divide-by-zero noise).
 */
export type PaceTone = "ok" | "warn" | "alert";
export function getPaceTone(qElapsedSecs: number, targetPerQuestionSecs: number): PaceTone {
  if (targetPerQuestionSecs <= 0) return "ok";
  const ratio = qElapsedSecs / targetPerQuestionSecs;
  if (ratio <= 1.2) return "ok";
  if (ratio <= 2) return "warn";
  return "alert";
}

/**
 * Per-topic progress summary used by the right-side stats panel.
 * `answeredIndices` is the set of question-indices that have been answered.
 * Topics appear in the order they were first seen in `questions`.
 */
export type TopicProgress = { name: string; total: number; done: number };

export function summarizeTopicProgress(
  questions: Pick<Question, "topic">[],
  answeredIndices: Set<number>,
): TopicProgress[] {
  const order: string[] = [];
  const totals = new Map<string, number>();
  const dones = new Map<string, number>();

  questions.forEach((q, i) => {
    const name = q.topic?.name ?? "General";
    if (!totals.has(name)) {
      order.push(name);
      totals.set(name, 0);
      dones.set(name, 0);
    }
    totals.set(name, (totals.get(name) ?? 0) + 1);
    if (answeredIndices.has(i)) {
      dones.set(name, (dones.get(name) ?? 0) + 1);
    }
  });

  return order.map(name => ({
    name,
    total: totals.get(name) ?? 0,
    done: dones.get(name) ?? 0,
  }));
}
