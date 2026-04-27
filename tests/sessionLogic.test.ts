import { describe, it, expect } from "vitest";
import {
  formatTimer,
  getPaceTone,
  summarizeTopicProgress,
} from "@/app/dashboard/util/practice/sessionLogic";
import type { Question } from "@/app/dashboard/util/types/pratcie/StartPracticeTypes";

// Minimal fixture: only the field summarizeTopicProgress reads.
function q(topicName: string): Pick<Question, "topic"> {
  return { topic: { id: 0, name: topicName } as Question["topic"] };
}

describe("formatTimer — countdown / per-question display", () => {
  it("formats seconds < 60 with a 0-minute prefix and zero-padded seconds", () => {
    expect(formatTimer(0)).toBe("0:00");
    expect(formatTimer(7)).toBe("0:07");
    expect(formatTimer(59)).toBe("0:59");
  });

  it("rolls over into minutes and pads single-digit seconds", () => {
    expect(formatTimer(60)).toBe("1:00");
    expect(formatTimer(65)).toBe("1:05");
    expect(formatTimer(125)).toBe("2:05");
  });

  it("handles long sessions over an hour as raw minutes", () => {
    expect(formatTimer(3661)).toBe("61:01");
  });

  it("clamps negative input to 0:00 (defensive)", () => {
    expect(formatTimer(-30)).toBe("0:00");
  });

  it("floors fractional seconds", () => {
    expect(formatTimer(65.9)).toBe("1:05");
  });
});

describe("getPaceTone — per-question pacing classification", () => {
  it('returns "ok" while elapsed ≤ 120% of target', () => {
    expect(getPaceTone(0, 60)).toBe("ok");
    expect(getPaceTone(30, 60)).toBe("ok");
    expect(getPaceTone(72, 60)).toBe("ok"); // exactly 1.2x
  });

  it('returns "warn" between 120% and 200% of target', () => {
    expect(getPaceTone(73, 60)).toBe("warn");
    expect(getPaceTone(120, 60)).toBe("warn"); // exactly 2x
  });

  it('returns "alert" past 200% of target', () => {
    expect(getPaceTone(121, 60)).toBe("alert");
    expect(getPaceTone(600, 60)).toBe("alert");
  });

  it('returns "ok" when target is 0 (untimed mode safety)', () => {
    expect(getPaceTone(99999, 0)).toBe("ok");
    expect(getPaceTone(0, 0)).toBe("ok");
  });
});

describe("summarizeTopicProgress — right-panel topic breakdown", () => {
  it("returns an empty list when there are no questions", () => {
    expect(summarizeTopicProgress([], new Set())).toEqual([]);
  });

  it("counts total per topic and zero done when nothing is answered yet", () => {
    const result = summarizeTopicProgress(
      [q("Algebra"), q("Algebra"), q("Geometry")],
      new Set(),
    );
    expect(result).toEqual([
      { name: "Algebra", total: 2, done: 0 },
      { name: "Geometry", total: 1, done: 0 },
    ]);
  });

  it("increments `done` only for answered indices", () => {
    const result = summarizeTopicProgress(
      [q("Algebra"), q("Geometry"), q("Algebra"), q("Geometry")],
      new Set([0, 3]), // answered: Algebra[0], Geometry[3]
    );
    expect(result).toEqual([
      { name: "Algebra", total: 2, done: 1 },
      { name: "Geometry", total: 2, done: 1 },
    ]);
  });

  it("preserves first-seen order of topics", () => {
    const result = summarizeTopicProgress(
      [q("Geometry"), q("Algebra"), q("Geometry"), q("Trigonometry")],
      new Set(),
    );
    expect(result.map(t => t.name)).toEqual(["Geometry", "Algebra", "Trigonometry"]);
  });

  it('falls back to "General" when a question has no topic name', () => {
    const result = summarizeTopicProgress(
      [{ topic: undefined as unknown as Question["topic"] }, q("Algebra")],
      new Set([0]),
    );
    expect(result).toEqual([
      { name: "General", total: 1, done: 1 },
      { name: "Algebra", total: 1, done: 0 },
    ]);
  });
});
