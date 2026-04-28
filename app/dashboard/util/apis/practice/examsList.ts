import { adminAxios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { examsListTypes } from "../../types/dashboard/examlisttypes";
import { QUERYKEY } from "@/key/queryKey";

export const PAGE_SIZE = 50;

export const getPracticeExamList = async (page = 1) => {
  const response = await adminAxios.get(
    `/api/v1/prep-master/exams/?page=${page}&page_size=${PAGE_SIZE}`
  );
  return response?.data as examsListTypes;
};

export const useGetPracticeExamList = (page = 1) => {
  return useQuery({
    // Explicit string key + page number — no spread, no staleTime
    queryKey: [QUERYKEY.PRACTICE_EXAMS_LIST, page],
    queryFn:  () => getPracticeExamList(page),
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });
};