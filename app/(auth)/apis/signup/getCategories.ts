import { tokenlessAxios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { QUERYKEY } from "@/key/queryKey";

export interface SignupCategory {
  id: number;
  name: string;
  description: string | null;
}

interface CategoriesResponse {
  status: string;
  data: SignupCategory[];
  message: string;
}

const getCategories = async (): Promise<CategoriesResponse> => {
  const response = await tokenlessAxios.get<CategoriesResponse>(
    `/api/v1/prep-master/exam-categories/`,
  );
  return response.data;
};

export const useGetSignupCategories = () =>
  useQuery({
    queryKey: QUERYKEY.PRACTICE_CATEGORIES,
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });

export interface SignupCategoryExam {
  id: number;
  reference: string;
  name: string;
  description: string;
  difficulty_level: string;
  is_premium: boolean;
  subject_count: number;
}

interface ExamsByCategoryResponse {
  status: string;
  data: SignupCategoryExam[];
  message: string;
}

const getExamsByCategory = async (categoryId: number): Promise<ExamsByCategoryResponse> => {
  const response = await tokenlessAxios.get<ExamsByCategoryResponse>(
    `/api/v1/prep-master/exams/?category=${categoryId}`,
  );
  return response.data;
};

export const useGetSignupExamsByCategory = (categoryId: number | null) =>
  useQuery({
    queryKey: [...QUERYKEY.PRACTICE_EXAMS_BY_CATEGORY, "signup", categoryId],
    queryFn: () => getExamsByCategory(categoryId as number),
    enabled: categoryId != null,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
