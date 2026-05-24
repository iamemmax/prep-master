"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import ExamForm from "../../components/ExamForm";
import SubjectManager from "../../components/SubjectManager";
import Breadcrumb from "../../components/Breadcrumb";
import { useAdminStore } from "../../util/store";

export default function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const numericId = Number(id);
  const exam = useAdminStore((s) => s.exams.find((e) => e.id === numericId));
  const category = useAdminStore((s) =>
    exam ? s.categories.find((c) => c.id === exam.category_id) : undefined,
  );

  if (!exam) return notFound();

  return (
    <div className="space-y-10">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Categories", href: "/admin/categories" },
          { label: category?.name ?? "—", href: category ? `/admin/categories/${category.id}` : undefined },
          { label: exam.name },
        ]}
      />
      <ExamForm mode="edit" initial={exam} />
      <SubjectManager examId={exam.id} categoryName={category?.name} />
    </div>
  );
}
