import { QUERYKEY } from "@/key/queryKey";
import { adminAxios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { availableExamDetails } from "../../types/dashboard/examlisttypes";

export const getAvailableExamsDetails = async (id:string) => {
  const response = await adminAxios.get(`api/v1/prepmaster/student/exam-types/${id}/`);
  return response?.data as availableExamDetails;
};

export const useGetAvailableExamsDetails = (id:string) => {
  return useQuery({
    queryKey: [QUERYKEY.PRACTICE_AVAILABLE_EXAMS_DETAILS,id],
    queryFn: ()=>getAvailableExamsDetails(id),
    enabled: !!id,
    staleTime: 1000 * 60,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};