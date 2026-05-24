"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import QuestionForm from "../../components/QuestionForm";
import Breadcrumb from "../../components/Breadcrumb";
import { useAdminStore } from "../../util/store";

function EditQuestionInner({ id }: { id: number }) {
  const question = useAdminStore((s) => s.questions.find((q) => q.id === id));
  const subjects = useAdminStore((s) => s.subjects);
  const exams    = useAdminStore((s) => s.exams);
  const categories = useAdminStore((s) => s.categories);

  if (!question) return notFound();

  const subject  = subjects.find((s) => s.id === question.subject_id);
  const exam     = subject ? exams.find((e) => e.id === subject.exam_id) : undefined;
  const category = exam ? categories.find((c) => c.id === exam.category_id) : undefined;

  return (
    <div className="max-w-4xl">
      <Link href="/admin/questions" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-[#F7C948] mb-4">
        <ArrowLeft size={12} /> Back to questions
      </Link>

      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Questions", href: "/admin/questions" },
          { label: category?.name ?? "—" },
          { label: exam?.name ?? "—" },
          { label: subject?.name ?? "—" },
        ]}
      />

      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Edit question</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Reassign the hierarchy or update the prompt, options, and explanation.
        </p>
      </header>

      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5">
        <QuestionForm mode="edit" initial={question} />
      </div>
    </div>
  );
}

export default function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={null}>
      <EditQuestionInner id={Number(id)} />
    </Suspense>
  );
}
