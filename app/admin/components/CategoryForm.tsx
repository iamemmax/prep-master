"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminCategory, useAdminStore } from "../util/store";
import CountrySelect from "./CountrySelect";

interface Props {
  mode: "create" | "edit";
  initial?: AdminCategory;
}

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function CategoryForm({ mode, initial }: Props) {
  const router = useRouter();
  const createCategory = useAdminStore((s) => s.createCategory);
  const updateCategory = useAdminStore((s) => s.updateCategory);
  const categories = useAdminStore((s) => s.categories);

  const nextOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.order)) + 1 : 1;

  const [name, setName]     = useState(initial?.name ?? "");
  const [slug, setSlug]     = useState(initial?.slug ?? "");
  const [region, setRegion] = useState(initial?.region ?? "");
  const [order, setOrder]   = useState<number>(initial?.order ?? nextOrder);
  const [touchedSlug, setTouchedSlug] = useState(mode === "edit");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const payload = {
      name: trimmed,
      slug: slug || slugify(trimmed),
      region: region.trim(),
      order,
    };
    if (mode === "create") createCategory(payload);
    else if (initial) updateCategory(initial.id, payload);
    router.push("/admin/categories");
  };

  return (
    <div className="max-w-xl">
      <Link href="/admin/categories" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-[#F7C948] mb-4">
        <ArrowLeft size={12} /> Back to categories
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {mode === "create" ? "New category" : "Edit category"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
          A category groups related exams on the library page.
        </p>
      </header>

      <form onSubmit={onSubmit} className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-4">
        <Field label="Name" hint="e.g. West Africa — Senior Secondary">
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

        <Field label="Slug" hint="URL-safe identifier, auto-generated from the name.">
          <input
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setTouchedSlug(true); }}
            className="w-full h-10 px-3 rounded-lg text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948]"
          />
        </Field>

        <Field label="Region / Country" hint="Pick a region for grouped exams or a single country if the category is country-specific.">
          <CountrySelect
            value={region}
            onChange={setRegion}
            placeholder="Select region or country"
            includeRegions
          />
        </Field>

        <Field label="Display order" hint="Lower numbers appear first.">
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            className="w-32 h-10 px-3 rounded-lg text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948]"
          />
        </Field>

        <div className="pt-3 flex items-center gap-2">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#F7C948] text-white hover:opacity-90"
          >
            {mode === "create" ? "Create category" : "Save changes"}
          </button>
          <Link
            href="/admin/categories"
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
