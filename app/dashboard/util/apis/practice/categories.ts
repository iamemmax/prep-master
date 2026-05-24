import { adminAxios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { QUERYKEY } from "@/key/queryKey";

// GET /api/v1/prep-master/exams/  — top-level groupings shown in the sidebar
export interface ExamCategory {
  id: number;
  name: string;
  description: string | null;
}

interface CategoriesResponse {
  status: string;
  data: ExamCategory[];
  message: string;
}

// Categories live at /exam-categories/; the /exams/ endpoint is reserved for
// the exam types within a category (filtered with `?category=<id>`).
const getCategories = async (): Promise<CategoriesResponse> => {
  const response = await adminAxios.get<CategoriesResponse>(`/api/v1/prep-master/exam-categories/`);
  return response?.data;
};

export const useGetCategories = () =>
  useQuery({
    queryKey: QUERYKEY.PRACTICE_CATEGORIES,
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });

// GET /api/v1/prep-master/exams/?category=<id>  — exam types (WAEC, NECO, …)
// within a single category. Returned shape mirrors the legacy "exams list"
// API minus the wrapping pagination fields.
export interface CategoryExam {
  id: number;
  reference: string;
  name: string;
  description: string;
  difficulty_level: "easy" | "medium" | "hard" | string;
  is_premium: boolean;
  subject_count: number;
}

interface ExamsByCategoryResponse {
  status: string;
  data: CategoryExam[];
  message: string;
}

const getExamsByCategory = async (categoryId: number): Promise<ExamsByCategoryResponse> => {
  const response = await adminAxios.get<ExamsByCategoryResponse>(
    `/api/v1/prep-master/exams/?category=${categoryId}`,
  );
  return response?.data;
};

export const useGetExamsByCategory = (categoryId: number | null) =>
  useQuery({
    queryKey: [...QUERYKEY.PRACTICE_EXAMS_BY_CATEGORY, categoryId],
    queryFn: () => getExamsByCategory(categoryId as number),
    enabled: categoryId != null,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
