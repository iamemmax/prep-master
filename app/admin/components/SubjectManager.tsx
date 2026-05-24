"use client";

import { useMemo, useState, FormEvent } from "react";
import Link from "next/link";
import { Plus, Trash2, Pencil, Check, X, HelpCircle } from "lucide-react";
import { AdminSubject, useAdminStore } from "../util/store";

export default function SubjectManager({ examId, categoryName }: { examId: number; categoryName?: string }) {
  const allSubjects = useAdminStore((s) => s.subjects);
  const subjects = useMemo(() => allSubjects.filter((sub) => sub.exam_id === examId), [allSubjects, examId]);
  const questions = useAdminStore((s) => s.questions);
  const exam = useAdminStore((s) => s.exams.find((e) => e.id === examId));
  const createSubject = useAdminStore((s) => s.createSubject);
  const updateSubject = useAdminStore((s) => s.updateSubject);
  const deleteSubject = useAdminStore((s) => s.deleteSubject);

  const [newName, setNewName]             = useState("");
  const [newDifficulty, setNewDifficulty] = useState<AdminSubject["difficulty_level"]>("medium");
  const [editingId, setEditingId]         = useState<number | null>(null);
  const [editName, setEditName]           = useState("");
  const [editDifficulty, setEditDifficulty] = useState<AdminSubject["difficulty_level"]>("medium");

  const onAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createSubject({ exam_id: examId, name: newName.trim(), difficulty_level: newDifficulty });
    setNewName("");
    setNewDifficulty("medium");
  };

  const startEdit = (sub: AdminSubject) => {
    setEditingId(sub.id);
    setEditName(sub.name);
    setEditDifficulty(sub.difficulty_level);
  };

  const saveEdit = () => {
    if (editingId == null || !editName.trim()) return;
    updateSubject(editingId, { name: editName.trim(), difficulty_level: editDifficulty });
    setEditingId(null);
  };

  const onDelete = (sub: AdminSubject) => {
    if (confirm(`Delete subject "${sub.name}"? Its questions will also be removed.`)) deleteSubject(sub.id);
  };

  const questionCountForSubject = (subjectId: number) =>
    questions.filter((q) => q.subject_id === subjectId).length;

  return (
    <section>
      <header className="flex items-end justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold">Subjects (courses)</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {categoryName && exam ? `${categoryName} › ${exam.name} · ` : ""}
            {subjects.length} {subjects.length === 1 ? "subject" : "subjects"} attached.
          </p>
        </div>
      </header>

      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-hidden">
        {/* Add row */}
        <form onSubmit={onAdd} className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Subject name (e.g. Mathematics)"
            className="flex-1 min-w-50 h-9 px-3 rounded-lg text-sm bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948]"
          />
          <select
            value={newDifficulty}
            onChange={(e) => setNewDifficulty(e.target.value as AdminSubject["difficulty_level"])}
            className="h-9 px-2 rounded-lg text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948]"
          >
            <option value="easy">Beginner</option>
            <option value="medium">Intermediate</option>
            <option value="hard">Advanced</option>
          </select>
          <button
            type="submit"
            className="h-9 px-3 rounded-lg text-xs font-semibold bg-[#F7C948] text-white hover:opacity-90 inline-flex items-center gap-1"
          >
            <Plus size={12} /> Add
          </button>
        </form>

        {/* List */}
        <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
          {subjects.length === 0 ? (
            <li className="px-4 py-6 text-sm text-slate-400 text-center">No subjects yet.</li>
          ) : (
            subjects.map((sub) => {
              const isEditing = editingId === sub.id;
              const qCount = questionCountForSubject(sub.id);
              return (
                <li key={sub.id} className="px-4 py-3 flex items-center gap-3">
                  {isEditing ? (
                    <>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 h-9 px-3 rounded-lg text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948]"
                        autoFocus
                      />
                      <select
                        value={editDifficulty}
                        onChange={(e) => setEditDifficulty(e.target.value as AdminSubject["difficulty_level"])}
                        className="h-9 px-2 rounded-lg text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948]"
                      >
                        <option value="easy">Beginner</option>
                        <option value="medium">Intermediate</option>
                        <option value="hard">Advanced</option>
                      </select>
                      <button onClick={saveEdit} className="text-emerald-600 hover:text-emerald-700" aria-label="Save">
                        <Check size={16} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600" aria-label="Cancel">
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{sub.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {difficultyLabel(sub.difficulty_level)} · {qCount} {qCount === 1 ? "question" : "questions"}
                        </p>
                      </div>
                      <Link
                        href={`/admin/questions?subject=${sub.id}`}
                        className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-zinc-300 hover:text-[#F7C948]"
                      >
                        <HelpCircle size={12} /> Questions
                      </Link>
                      <button onClick={() => startEdit(sub)} className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-zinc-300 hover:text-[#F7C948]">
                        <Pencil size={12} /> Edit
                      </button>
                      <button onClick={() => onDelete(sub)} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600">
                        <Trash2 size={12} /> Delete
                      </button>
                    </>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </div>
    </section>
  );
}

function difficultyLabel(d: string) {
  switch (d) {
    case "easy":   return "Beginner";
    case "medium": return "Intermediate";
    case "hard":   return "Advanced";
    default:       return d;
  }
}
