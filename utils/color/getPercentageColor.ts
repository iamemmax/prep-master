export function getScoreAccent(score: number): string {
  if (score >= 80) return "#22C55E"; // green  — strong
  if (score >= 70) return "#3B82F6"; // blue   — good
  if (score >= 60) return "#F59E0B"; // amber  — average
  return "#EF4444";                  // red    — needs work
}