import { describe, it, expect } from "vitest";
import { parseOptions } from "@/app/dashboard/util/practice/parseOptions";

describe("parseOptions — start-practice question option normalization", () => {
  it("returns the array as-is when already shaped as Option[]", () => {
    const opts = [
      { id: 1, reference: "A", option_text: "Lagos" },
      { id: 2, reference: "B", option_text: "Abuja" },
    ];
    expect(parseOptions(opts)).toBe(opts);
  });

  it("converts a record object into Option[]", () => {
    const result = parseOptions({ A: "Lagos", B: "Abuja", C: "Kano" });
    expect(result).toEqual([
      { id: 0, reference: "A", option_text: "Lagos" },
      { id: 1, reference: "B", option_text: "Abuja" },
      { id: 2, reference: "C", option_text: "Kano" },
    ]);
  });

  it("parses a JSON-encoded record string into Option[]", () => {
    const json = JSON.stringify({ A: "Yes", B: "No" });
    expect(parseOptions(json)).toEqual([
      { id: 0, reference: "A", option_text: "Yes" },
      { id: 1, reference: "B", option_text: "No" },
    ]);
  });

  it("returns [] for malformed JSON strings", () => {
    expect(parseOptions("not-json")).toEqual([]);
  });

  it("returns [] for JSON strings that decode to non-objects", () => {
    expect(parseOptions("123")).toEqual([]);
    expect(parseOptions("null")).toEqual([]);
  });

  it("handles an empty record", () => {
    expect(parseOptions({})).toEqual([]);
  });

  it("preserves insertion order from the source object", () => {
    const result = parseOptions({ C: "third", A: "first", B: "second" });
    expect(result.map(o => o.reference)).toEqual(["C", "A", "B"]);
  });
});
