import { QUERYKEY } from "@/key/queryKey";
import { adminAxios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { practiceHistoryTypes } from "../../types/dashboard/practiceHistoryTypes";

export const getPracticeHistory = async (page = 1) => {
  const response = await adminAxios.get(`/api/v1/prepmaster/student/practice/history/?page=${page}`);
  return response?.data as practiceHistoryTypes;
};

export const useGetPracticeHistory = (page = 1) => {
  return useQuery({
    queryKey: [...QUERYKEY.DASHBOARD_PRACTICE_HISTORY, page],
    queryFn: () => getPracticeHistory(page),
    staleTime: 1000 * 60,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};