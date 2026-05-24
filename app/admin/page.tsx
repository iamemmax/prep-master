"use client";

import Link from "next/link";
import { FolderTree, BookOpen, Layers, HelpCircle, Users, ArrowRight } from "lucide-react";
import { useAdminStore } from "./util/store";

export default function AdminOverviewPage() {
  const categoryCount = useAdminStore((s) => s.categories.length);
  const examCount     = useAdminStore((s) => s.exams.length);
  const subjectCount  = useAdminStore((s) => s.subjects.length);
  const questionCount = useAdminStore((s) => s.questions.length);
  const userCount     = useAdminStore((s) => s.users.length);

  const stats = [
    { label: "Categories",    value: categoryCount, icon: FolderTree, href: "/admin/categories" },
    { label: "Subcategories", value: examCount,     icon: BookOpen,   href: "/admin/exams"      },
    { label: "Subjects",      value: subjectCount,  icon: Layers,     href: "/admin/subjects"   },
    { label: "Questions",     value: questionCount, icon: HelpCircle, href: "/admin/questions"  },
    { label: "Users",         value: userCount,     icon: Users,      href: "/admin/users"      },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin overview</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Manage the exam library — categories, exams, subjects, and questions.
        </p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 hover:border-[#F7C948] transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-lg bg-[#F7C948]/15 text-[#894B00] grid place-items-center">
                <Icon size={16} />
              </span>
              <ArrowRight size={14} className="text-slate-300 dark:text-zinc-600 group-hover:text-[#F7C948] transition-colors" />
            </div>
            <p className="mt-3 text-2xl font-bold tabular-nums">{value}</p>
            <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 mt-1">{label}</p>
          </Link>
        ))}
      </section>

      <section className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5">
        <h2 className="text-sm font-bold mb-3">Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/categories/new" className="px-3 py-2 rounded-lg text-xs font-semibold bg-[#F7C948] text-white hover:opacity-90">+ New category</Link>
          <Link href="/admin/exams/new"      className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90">+ New exam</Link>
          <Link href="/admin/questions"      className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800">+ New question</Link>
        </div>
      </section>
    </div>
  );
}
