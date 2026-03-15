import { QUERYKEY } from "@/key/queryKey";
import { adminAxios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { startPracticeType } from "../../types/pratcie/StartPracticeTypes";

export const getPracticeQuestions = async (sessionId:string) => {
  const response = await adminAxios.get(`/api/v1/prepmaster/student/practice/session/${sessionId}`);
  return response?.data as startPracticeType;
};

export const useGetPracticeQuestions = (sessionId:string) => {
  return useQuery({
    queryKey:[ QUERYKEY.PRACTICE_QUESTION_DETAILS,sessionId],
    queryFn:()=> getPracticeQuestions(sessionId),
    staleTime: 1000 * 60,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled:!!sessionId
  });
};

