// Admin in-memory store backed by localStorage. Replace each mutation with
// a react-query mutation against the real admin API when it's available.

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  region: string;
  order: number;
}

export interface AdminSubject {
  id: number;
  exam_id: number;
  name: string;
  difficulty_level: "easy" | "medium" | "hard";
}

export interface AdminExam {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  country: string | null;
  description: string;
  is_premium: boolean;
  is_active: boolean;
  badge: "Most Popular" | "Top Rated" | "Premium" | null;
  difficulty_level: "easy" | "medium" | "hard";
}

export interface AdminQuestion {
  id: number;
  subject_id: number;
  text: string;
  options: { key: string; text: string; is_correct: boolean }[];
  difficulty_level: "easy" | "medium" | "hard";
  explanation?: string;
}

export interface AdminUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: "learner" | "educator" | "admin";
  status: "active" | "suspended" | "invited";
  plan: "free" | "pro" | "team";
  country: string | null;
  joined_at: string; // ISO
  last_seen_at: string | null;
}

interface State {
  categories: AdminCategory[];
  exams: AdminExam[];
  subjects: AdminSubject[];
  questions: AdminQuestion[];
  users: AdminUser[];
  _nextId: number;
}

interface Actions {
  // Categories
  createCategory: (input: Omit<AdminCategory, "id">) => AdminCategory;
  updateCategory: (id: number, patch: Partial<Omit<AdminCategory, "id">>) => void;
  deleteCategory: (id: number) => void;

  // Exams (a.k.a. subcategories)
  createExam: (input: Omit<AdminExam, "id">) => AdminExam;
  updateExam: (id: number, patch: Partial<Omit<AdminExam, "id">>) => void;
  deleteExam: (id: number) => void;

  // Subjects (a.k.a. courses)
  createSubject: (input: Omit<AdminSubject, "id">) => AdminSubject;
  updateSubject: (id: number, patch: Partial<Omit<AdminSubject, "id">>) => void;
  deleteSubject: (id: number) => void;

  // Questions
  createQuestion: (input: Omit<AdminQuestion, "id">) => AdminQuestion;
  bulkCreateQuestions: (rows: Omit<AdminQuestion, "id">[]) => number;
  updateQuestion: (id: number, patch: Partial<Omit<AdminQuestion, "id">>) => void;
  deleteQuestion: (id: number) => void;

  // Users
  updateUser: (id: number, patch: Partial<Omit<AdminUser, "id">>) => void;
  deleteUser: (id: number) => void;
  inviteUser: (input: Pick<AdminUser, "first_name" | "last_name" | "email" | "role">) => AdminUser;

  reset: () => void;
}

const seed: State = {
  _nextId: 1000,
  categories: [
    { id: 1,  name: "West Africa — Primary",            slug: "wa-primary",   region: "West Africa",            order: 1  },
    { id: 2,  name: "West Africa — Junior Secondary",   slug: "wa-jss",       region: "West Africa",            order: 2  },
    { id: 3,  name: "West Africa — Senior Secondary",   slug: "wa-sss",       region: "West Africa",            order: 3  },
    { id: 4,  name: "Francophone West Africa",          slug: "fr-wa",        region: "Francophone",            order: 4  },
    { id: 5,  name: "East & Southern Africa",           slug: "esa",          region: "East & Southern Africa", order: 5  },
    { id: 6,  name: "International School",             slug: "intl-school",  region: "International",          order: 6  },
    { id: 7,  name: "University Admissions",            slug: "uni-admit",    region: "International",          order: 7  },
    { id: 8,  name: "English Proficiency",              slug: "en-prof",      region: "International",          order: 8  },
    { id: 9,  name: "Undergraduate Studies",            slug: "ug",           region: "Tertiary",               order: 9  },
    { id: 10, name: "Postgraduate Studies",             slug: "pg",           region: "Tertiary",               order: 10 },
    { id: 11, name: "Medicine & Healthcare",            slug: "medicine",     region: "Professional",           order: 11 },
    { id: 12, name: "Finance & Accounting",             slug: "finance",      region: "Professional",           order: 12 },
    { id: 13, name: "Technology & Cloud",               slug: "tech",         region: "Professional",           order: 13 },
    { id: 14, name: "Professional Bodies — Nigeria",    slug: "pro-ng",       region: "Professional",           order: 14 },
    { id: 15, name: "Professional Bodies — International", slug: "pro-intl",  region: "Professional",           order: 15 },
  ],
  exams: [
    { id: 1, name: "Common Entrance",   slug: "common-entrance", category_id: 1, country: "Nigeria",      description: "Nigerian Primary School Leaving Examination",        is_premium: false, is_active: true, badge: null,            difficulty_level: "easy"   },
    { id: 2, name: "NPSE",              slug: "npse",            category_id: 1, country: "Sierra Leone", description: "Sierra Leone National Primary School Examination",   is_premium: false, is_active: true, badge: null,            difficulty_level: "easy"   },
    { id: 3, name: "WAEC",              slug: "waec",            category_id: 3, country: "West Africa",  description: "West African Senior School Certificate Examination", is_premium: false, is_active: true, badge: "Most Popular",  difficulty_level: "medium" },
    { id: 4, name: "JAMB / UTME",       slug: "jamb",            category_id: 3, country: "Nigeria",      description: "Joint Admissions and Matriculation Board",           is_premium: false, is_active: true, badge: "Top Rated",     difficulty_level: "medium" },
    { id: 5, name: "SAT",               slug: "sat",             category_id: 7, country: "International",description: "Scholastic Assessment Test",                         is_premium: true,  is_active: true, badge: "Premium",       difficulty_level: "medium" },
  ],
  subjects: [
    { id: 1, exam_id: 3, name: "English Language", difficulty_level: "medium" },
    { id: 2, exam_id: 3, name: "Mathematics",      difficulty_level: "medium" },
    { id: 3, exam_id: 3, name: "Physics",          difficulty_level: "hard"   },
    { id: 4, exam_id: 4, name: "Use of English",   difficulty_level: "medium" },
    { id: 5, exam_id: 4, name: "Mathematics",      difficulty_level: "medium" },
    { id: 6, exam_id: 5, name: "Math",             difficulty_level: "medium" },
    { id: 7, exam_id: 5, name: "Reading & Writing",difficulty_level: "medium" },
  ],
  questions: [],
  users: [
    { id: 101, first_name: "Ada",       last_name: "Okafor",     email: "ada@example.com",      role: "learner",  status: "active",    plan: "pro",  country: "Nigeria",      joined_at: "2026-02-12T09:14:00Z", last_seen_at: "2026-04-30T17:22:00Z" },
    { id: 102, first_name: "Kwame",     last_name: "Mensah",     email: "kwame@example.com",    role: "learner",  status: "active",    plan: "free", country: "Ghana",        joined_at: "2026-03-04T11:48:00Z", last_seen_at: "2026-05-01T08:01:00Z" },
    { id: 103, first_name: "Fatou",     last_name: "Diallo",     email: "fatou@example.com",    role: "educator", status: "active",    plan: "team", country: "Senegal",      joined_at: "2025-11-20T14:30:00Z", last_seen_at: "2026-04-27T20:11:00Z" },
    { id: 104, first_name: "Chinedu",   last_name: "Okonkwo",    email: "chinedu@example.com",  role: "learner",  status: "suspended", plan: "free", country: "Nigeria",      joined_at: "2026-01-09T07:00:00Z", last_seen_at: "2026-03-14T18:42:00Z" },
    { id: 105, first_name: "Aisha",     last_name: "Bello",      email: "aisha@example.com",    role: "admin",    status: "active",    plan: "team", country: "Nigeria",      joined_at: "2025-08-01T09:00:00Z", last_seen_at: "2026-05-02T22:15:00Z" },
    { id: 106, first_name: "Lerato",    last_name: "Khumalo",    email: "lerato@example.com",   role: "learner",  status: "invited",   plan: "free", country: "South Africa", joined_at: "2026-05-01T16:00:00Z", last_seen_at: null },
  ],
};

export const useAdminStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...seed,

      createCategory: (input) => {
        const id = get()._nextId;
        const row: AdminCategory = { ...input, id };
        set((s) => ({ categories: [...s.categories, row], _nextId: id + 1 }));
        return row;
      },
      updateCategory: (id, patch) =>
        set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          exams: s.exams.filter((e) => e.category_id !== id),
        })),

      createExam: (input) => {
        const id = get()._nextId;
        const row: AdminExam = { ...input, id };
        set((s) => ({ exams: [...s.exams, row], _nextId: id + 1 }));
        return row;
      },
      updateExam: (id, patch) =>
        set((s) => ({ exams: s.exams.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      deleteExam: (id) =>
        set((s) => ({
          exams: s.exams.filter((e) => e.id !== id),
          subjects: s.subjects.filter((sub) => sub.exam_id !== id),
        })),

      createSubject: (input) => {
        const id = get()._nextId;
        const row: AdminSubject = { ...input, id };
        set((s) => ({ subjects: [...s.subjects, row], _nextId: id + 1 }));
        return row;
      },
      updateSubject: (id, patch) =>
        set((s) => ({ subjects: s.subjects.map((sub) => (sub.id === id ? { ...sub, ...patch } : sub)) })),
      deleteSubject: (id) =>
        set((s) => ({
          subjects: s.subjects.filter((sub) => sub.id !== id),
          questions: s.questions.filter((q) => q.subject_id !== id),
        })),

      createQuestion: (input) => {
        const id = get()._nextId;
        const row: AdminQuestion = { ...input, id };
        set((s) => ({ questions: [...s.questions, row], _nextId: id + 1 }));
        return row;
      },
      bulkCreateQuestions: (rows) => {
        let nextId = get()._nextId;
        const created: AdminQuestion[] = rows.map((r) => ({ ...r, id: nextId++ }));
        set((s) => ({ questions: [...s.questions, ...created], _nextId: nextId }));
        return created.length;
      },
      updateQuestion: (id, patch) =>
        set((s) => ({ questions: s.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)) })),
      deleteQuestion: (id) =>
        set((s) => ({ questions: s.questions.filter((q) => q.id !== id) })),

      updateUser: (id, patch) =>
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) })),
      deleteUser: (id) =>
        set((s) => ({ users: s.users.filter((u) => u.id !== id) })),
      inviteUser: ({ first_name, last_name, email, role }) => {
        const id = get()._nextId;
        const row: AdminUser = {
          id,
          first_name,
          last_name,
          email,
          role,
          status: "invited",
          plan: "free",
          country: null,
          joined_at: new Date().toISOString(),
          last_seen_at: null,
        };
        set((s) => ({ users: [...s.users, row], _nextId: id + 1 }));
        return row;
      },

      reset: () => set(seed),
    }),
    { name: "prepmaster-admin-store" },
  ),
);

// Plain helper functions — call them with the *array* selectors below so each
// useAdminStore call returns a stable reference (arrays only change on
// mutation, not on every render).
export function countSubjectsForExam(subjects: AdminSubject[], examId: number) {
  return subjects.filter((s) => s.exam_id === examId).length;
}
export function countQuestionsForExam(
  subjects: AdminSubject[],
  questions: AdminQuestion[],
  examId: number,
) {
  const subjectIds = new Set(subjects.filter((s) => s.exam_id === examId).map((s) => s.id));
  return questions.filter((q) => subjectIds.has(q.subject_id)).length;
}
export function countExamsForCategory(exams: AdminExam[], categoryId: number) {
  return exams.filter((e) => e.category_id === categoryId).length;
}
