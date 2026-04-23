// Tracks the user's best score per exam_type in localStorage. Used to
// surface "new personal best!" moments at session end.

const STORAGE_KEY = "prep:personal_bests";

type BestsMap = Record<string, number>;

function read(): BestsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? (parsed as BestsMap) : {};
  } catch { return {}; }
}

function write(map: BestsMap) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(map)); } catch { /* noop */ }
}

export function getPersonalBest(examType: string): number | null {
  const map = read();
  const v = map[examType];
  return typeof v === "number" ? v : null;
}

/**
 * Record a new score. Returns `true` if it was a new best (including the very
 * first score for this exam type — nothing-is-everything).
 */
export function recordScore(examType: string, score: number): boolean {
  if (!examType || typeof score !== "number" || Number.isNaN(score)) return false;
  const map = read();
  const prev = map[examType];
  const isBest = typeof prev !== "number" || score > prev;
  if (isBest) {
    map[examType] = score;
    write(map);
  }
  return isBest;
}
