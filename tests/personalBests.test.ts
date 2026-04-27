import { describe, it, expect, beforeEach } from "vitest";
import {
  getPersonalBest,
  recordScore,
} from "@/app/dashboard/util/shared/personalBests";

describe("personalBests — start-practice score tracker", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when no score has ever been recorded for an exam", () => {
    expect(getPersonalBest("WAEC")).toBeNull();
  });

  it("treats the very first score as a personal best", () => {
    expect(recordScore("WAEC", 72)).toBe(true);
    expect(getPersonalBest("WAEC")).toBe(72);
  });

  it("records a higher score and reports it as a new best", () => {
    recordScore("WAEC", 72);
    expect(recordScore("WAEC", 85)).toBe(true);
    expect(getPersonalBest("WAEC")).toBe(85);
  });

  it("does not overwrite when the new score is lower", () => {
    recordScore("WAEC", 85);
    expect(recordScore("WAEC", 60)).toBe(false);
    expect(getPersonalBest("WAEC")).toBe(85);
  });

  it("does not overwrite when the new score ties the best", () => {
    recordScore("WAEC", 80);
    expect(recordScore("WAEC", 80)).toBe(false);
    expect(getPersonalBest("WAEC")).toBe(80);
  });

  it("tracks scores per exam type independently", () => {
    recordScore("WAEC", 90);
    recordScore("JAMB", 65);
    expect(getPersonalBest("WAEC")).toBe(90);
    expect(getPersonalBest("JAMB")).toBe(65);
  });

  it("rejects invalid input without writing to storage", () => {
    expect(recordScore("", 50)).toBe(false);
    expect(recordScore("WAEC", Number.NaN)).toBe(false);
    expect(getPersonalBest("WAEC")).toBeNull();
  });

  it("recovers gracefully from corrupted localStorage data", () => {
    localStorage.setItem("prep:personal_bests", "{not valid json");
    expect(getPersonalBest("WAEC")).toBeNull();
    expect(recordScore("WAEC", 70)).toBe(true);
    expect(getPersonalBest("WAEC")).toBe(70);
  });
});
