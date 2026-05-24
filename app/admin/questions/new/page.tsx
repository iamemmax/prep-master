"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, FilePlus2, Upload, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuestionForm from "../../components/QuestionForm";
import QuestionBulkUpload from "../../components/QuestionBulkUpload";
import QuestionAIGenerate from "../../components/QuestionAIGenerate";

function NewQuestionInner() {
  return (
    <div className="max-w-4xl">
      <Link href="/admin/questions" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-[#F7C948] mb-4">
        <ArrowLeft size={12} /> Back to questions
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">New question</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Add one manually, upload a CSV / JSON / PDF / Word file in bulk, or let AI draft a batch for you.
        </p>
      </header>

      <Tabs defaultValue="manual" className="gap-5">
        <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex">
          <TabsTrigger value="manual" className="gap-1.5">
            <FilePlus2 size={14} /> Manual
          </TabsTrigger>
          <TabsTrigger value="bulk" className="gap-1.5">
            <Upload size={14} /> Bulk upload
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5">
            <Sparkles size={14} /> AI generate
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <div className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5">
            <QuestionForm mode="create" />
          </div>
        </TabsContent>

        <TabsContent value="bulk">
          <div className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5">
            <QuestionBulkUpload />
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <div className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5">
            <QuestionAIGenerate />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function NewQuestionPage() {
  return (
    <Suspense fallback={null}>
      <NewQuestionInner />
    </Suspense>
  );
}
