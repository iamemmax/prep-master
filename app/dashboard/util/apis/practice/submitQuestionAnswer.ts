import { adminAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";


interface prop{
  session_id: number;
 data:{
  question_id: number;
  selected_answer: string 
 }
}
interface successMsg {
  status: string;
  data: Data;
  message: string;
}

interface Data {
  is_correct: boolean;
}
const submitQuestionAnswer = async (data: prop) => {
  const response = await adminAxios.post(`/api/v1/prepmaster/student/practice/session/${data?.session_id}/submit/`, data?.data);
  return response.data as successMsg;
}


export const useSubmitQuestionAnswer = () => {
    return useMutation({
        mutationFn: submitQuestionAnswer,
        
      })
}