import { SessionFormData } from "@/app/dashboard/components/practices/StartSessionModal";
import { adminAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { startPracticeType } from "../../types/pratcie/StartPracticeTypes";




const startPracticeExam = async (data: SessionFormData) => {
  const response = await adminAxios.post(`/api/v1/prepmaster/student/practice/start/`, data);
  return response.data as startPracticeType;
}


export const useStartPracticeExam = () => {
    return useMutation({
        mutationFn: startPracticeExam,
        
      })
}