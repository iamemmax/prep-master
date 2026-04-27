import { Option } from "@/app/dashboard/util/types/pratcie/StartPracticeTypes";

// Backend returns question options in three shapes depending on the exam:
//   1. Pre-shaped Option[] array (already correct)
//   2. A plain object { A: "Lagos", B: "Abuja", ... }
//   3. A JSON string of (2)
// This normalizes all three into Option[].
export function parseOptions(raw: Option[] | Record<string, string> | string): Option[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "object" && raw !== null) {
    return Object.entries(raw).map(([key, val], i) => ({
      id: i,
      reference: key,
      option_text: val,
    }));
  }
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return [];
    return Object.entries(parsed).map(([key, val], i) => ({
      id: i,
      reference: key,
      option_text: val as string,
    }));
  } catch {
    return [];
  }
}
