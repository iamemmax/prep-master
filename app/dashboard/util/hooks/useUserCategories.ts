import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { adminAxios } from "@/lib/axios";
import { QUERYKEY } from "@/key/queryKey";
import { useGetCategories } from "../apis/practice/categories";
import { useGetPracticeExamConfig } from "../apis/practice/fetchExamConfig";

interface CategoryExamLite {
  id: number;
  name: string;
  description?: string;
  is_premium?: boolean;
  subject_count?: number;
}

interface ExamsByCategoryResp {
  status: string;
  data: CategoryExamLite[];
  message: string;
}

export interface UserCategory {
  id: number;
  name: string;
  description: string | null;
  exams: CategoryExamLite[];
}

/**
 * Categories the user is enrolled in (i.e. that contain at least one of the
 * user's configured exams), each with the list of those exams. Fans out the
 * per-category /exams/?category= endpoint via useQueries so individual
 * useGetExamsByCategory calls elsewhere hit the same cache.
 */
export function useUserCategories() {
  const { data: categoriesResp, isLoading: catsLoading, error: catsError } = useGetCategories();
  const allCategories = useMemo(() => categoriesResp?.data ?? [], [categoriesResp]);

  const { data: examConfigResp, isLoading: examConfigLoading } = useGetPracticeExamConfig();
  const userExamIds = useMemo(
    () =>
      new Set(
        (examConfigResp?.data ?? [])
          .filter((c) => c.exam_type != null)
          .map((c) => c.exam_type.id),
      ),
    [examConfigResp],
  );

  const categoryExamsQueries = useQueries({
    queries: allCategories.map((cat) => ({
      queryKey: [...QUERYKEY.PRACTICE_EXAMS_BY_CATEGORY, cat.id],
      queryFn: async (): Promise<ExamsByCategoryResp> => {
        const res = await adminAxios.get<ExamsByCategoryResp>(
          `/api/v1/prep-master/exams/?category=${cat.id}`,
        );
        return res.data;
      },
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    })),
  });
  const examQueriesLoading = categoryExamsQueries.some((q) => q.isLoading);

  const userCategories = useMemo<UserCategory[]>(() => {
    return allCategories
      .map((cat, i) => {
        const exams = (categoryExamsQueries[i]?.data?.data ?? []).filter((e) =>
          userExamIds.has(e.id),
        );
        return {
          id: cat.id,
          name: cat.name,
          description: cat.description ?? null,
          exams,
        };
      })
      .filter((c) => c.exams.length > 0);
  }, [allCategories, categoryExamsQueries, userExamIds]);

  return {
    userCategories,
    isLoading: catsLoading || examConfigLoading || examQueriesLoading,
    error: catsError,
  };
}
