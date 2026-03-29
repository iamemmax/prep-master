import { adminAxios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { examsListTypes } from "../../types/dashboard/examlisttypes";

export const PAGE_SIZE = 20;

export const getPracticeExamList = async (page = 1) => {
  const response = await adminAxios.get(
    `/api/v1/prepmaster/student/exam-types/?page=${page}&page_size=${PAGE_SIZE}`
  );
  return response?.data as examsListTypes;
};

export const useGetPracticeExamList = (page = 1) => {
  return useQuery({
    // Explicit string key + page number — no spread, no staleTime
    queryKey: ["practice-exams-list", page],
    queryFn:  () => getPracticeExamList(page),
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });
};