"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminExam, useAdminStore } from "../util/store";
import CountrySelect from "./CountrySelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  mode: "create" | "edit";
  initial?: AdminExam;
}

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function ExamForm({ mode, initial }: Props) {
  const router = useRouter();
  const search = useSearchParams();
  const categories = useAdminStore((s) => s.categories);
  const createExam = useAdminStore((s) => s.createExam);
  const updateExam = useAdminStore((s) => s.updateExam);

  const presetCategory = search.get("category");
  const defaultCategoryId =
    initial?.category_id ??
    (presetCategory ? Number(presetCategory) : categories[0]?.id ?? 0);

  const [name, setName]               = useState(initial?.name ?? "");
  const [slug, setSlug]               = useState(initial?.slug ?? "");
  const [categoryId, setCategoryId]   = useState<number>(defaultCategoryId);
  const [country, setCountry]         = useState(initial?.country ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isPremium, setIsPremium]     = useState(initial?.is_premium ?? false);
  const [isActive, setIsActive]       = useState(initial?.is_active ?? true);
  const [badge, setBadge]             = useState<AdminExam["badge"]>(initial?.badge ?? null);
  const [difficulty, setDifficulty]   = useState<AdminExam["difficulty_level"]>(initial?.difficulty_level ?? "medium");
  const [touchedSlug, setTouchedSlug] = useState(mode === "edit");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;
    const payload = {
      name: name.trim(),
      slug: slug || slugify(name),
      category_id: categoryId,
      country: country.trim() || null,
      description: description.trim(),
      is_premium: isPremium,
      is_active: isActive,
      badge,
      difficulty_level: difficulty,
    };
    if (mode === "create") createExam(payload);
    else if (initial) updateExam(initial.id, payload);
    router.push("/admin/exams");
  };

  return (
    <div className="max-w-2xl">
      <Link href="/admin/exams" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-[#F7C948] mb-4">
        <ArrowLeft size={12} /> Back to subcategories
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {mode === "create" ? "New subcategory" : "Edit subcategory"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
          A subcategory (exam) belongs to a category and groups related subjects.
        </p>
      </header>

      <form onSubmit={onSubmit} className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name" hint="e.g. WAEC, JAMB / UTME">
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!touchedSlug) setSlug(slugify(e.target.value));
              }}
              required
              className="w-full h-10 px-3 rounded-lg text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948]"
            />
          </Field>

          <Field label="Slug">
            <input
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setTouchedSlug(true); }}
              className="w-full h-10 px-3 rounded-lg text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948]"
            />
          </Field>

          <Field label="Parent category">
            <Select
              value={categoryId ? String(categoryId) : ""}
              onValueChange={(v) => setCategoryId(Number(v))}
            >
              <SelectTrigger className="w-full bg-slate-50 dark:bg-zinc-800 text-sm">
                <SelectValue placeholder={categories.length === 0 ? "Create a category first" : "Select category"} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Country" hint="Where this exam is administered.">
            <CountrySelect
              value={country ?? ""}
              onChange={setCountry}
              placeholder="Select country"
              includeRegions
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948] resize-y"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Badge">
            <Select
              value={badge ?? "__none"}
              onValueChange={(v) => setBadge((v === "__none" ? null : v) as AdminExam["badge"])}
            >
              <SelectTrigger className="w-full bg-slate-50 dark:bg-zinc-800 text-sm">
                <SelectValue placeholder="No badge" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">None</SelectItem>
                <SelectItem value="Most Popular">Most Popular</SelectItem>
                <SelectItem value="Top Rated">Top Rated</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Difficulty">
            <Select
              value={difficulty}
              onValueChange={(v) => setDifficulty(v as AdminExam["difficulty_level"])}
            >
              <SelectTrigger className="w-full bg-slate-50 dark:bg-zinc-800 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Beginner</SelectItem>
                <SelectItem value="medium">Intermediate</SelectItem>
                <SelectItem value="hard">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="flex items-center gap-5 pt-1">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Premium
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Active
          </label>
        </div>

        <div className="pt-3 flex items-center gap-2">
          <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#F7C948] text-white hover:opacity-90">
            {mode === "create" ? "Create subcategory" : "Save changes"}
          </button>
          <Link
            href="/admin/exams"
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-slate-400 dark:text-zinc-500">{hint}</p>}
    </div>
  );
}
