import { QUERYKEY } from "@/key/queryKey";
import { adminAxios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { examsListTypes } from "../../types/dashboard/examlisttypes";

export const getPracticeExamList = async () => {
  const response = await adminAxios.get(`/api/v1/prepmaster/student/exam-types/`);
  return response?.data as examsListTypes;
};

export const useGetPracticeExamList = () => {
  return useQuery({
    queryKey: QUERYKEY.PRACTICE_EXAMS_LIST,
    queryFn: getPracticeExamList,
    staleTime: 1000 * 60,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};