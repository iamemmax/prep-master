import { describe, it, expect } from "vitest";
import { getBadgeClass, getBorderClass } from "@/app/dashboard/practice/page";

describe("getBadgeClass — exam card badge styling", () => {
  it('returns the green palette for "Most Popular"', () => {
    expect(getBadgeClass("Most Popular")).toContain("text-[#10B97D]");
  });

  it('returns the indigo palette for "Top Rated"', () => {
    expect(getBadgeClass("Top Rated")).toContain("text-[#4E49F6]");
  });

  it('returns the amber palette for "Premium"', () => {
    expect(getBadgeClass("Premium")).toContain("text-[#FEAA2A]");
  });

  it("falls back to slate styling for unknown badges", () => {
    expect(getBadgeClass("New & Shiny")).toContain("text-slate-600");
  });

  it("falls back to slate styling when no badge is set", () => {
    expect(getBadgeClass(null)).toContain("text-slate-600");
  });
});

describe("getBorderClass — exam card border by difficulty", () => {
  it("uses emerald for easy", () => {
    expect(getBorderClass("easy")).toContain("emerald");
  });

  it("uses amber for medium", () => {
    expect(getBorderClass("medium")).toContain("amber");
  });

  it("uses red for hard", () => {
    expect(getBorderClass("hard")).toContain("red");
  });
});
