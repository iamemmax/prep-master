"use client";

import { useMemo } from "react";
import { getNames } from "country-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REGION_OPTIONS = [
  "Global",
  "West Africa",
  "East & Southern Africa",
  "Francophone West Africa",
  "International",
  "Tertiary",
  "Professional",
] as const;

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  includeRegions?: boolean;
  hasError?: boolean;
  size?: "sm" | "default";
}

export default function CountrySelect({
  value,
  onChange,
  placeholder = "Select country",
  includeRegions = false,
  hasError = false,
  size = "default",
}: Props) {
  const countries = useMemo(() => getNames().sort((a, b) => a.localeCompare(b)), []);

  // Sentinel passed through onChange when the user clears their selection.
  // Radix Select disallows an empty-string `value` on SelectItem, so we use
  // "__none" internally and convert at the boundary.
  const internal = value === "" ? "__none" : value;

  return (
    <Select value={internal} onValueChange={(v) => onChange(v === "__none" ? "" : v)}>
      <SelectTrigger
        size={size}
        className={`w-full bg-slate-50 dark:bg-zinc-800 text-sm ${hasError ? "border-rose-500" : ""}`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-80">
        <SelectItem value="__none">— None —</SelectItem>
        {includeRegions && (
          <>
            <SelectGroupLabel>Regions</SelectGroupLabel>
            {REGION_OPTIONS.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
            <SelectGroupLabel>Countries</SelectGroupLabel>
          </>
        )}
        {countries.map((c) => (
          <SelectItem key={c} value={c}>{c}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function SelectGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 select-none">
      {children}
    </div>
  );
}
