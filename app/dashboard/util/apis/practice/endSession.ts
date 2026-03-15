import { adminAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";


interface prop{
  session_id: number;
 
}
interface successMsg {
  status: string;
  data: Data;
  message: string;
}

interface Data {
  message: string;
  score: number;
  correct_answers: number;
  total_questions: number;
}
const endSession = async (data: prop) => {
  const response = await adminAxios.post(`/api/v1/prepmaster/student/practice/session/${data?.session_id}/end/`);
  return response.data as successMsg;
}


export const useEndSession = () => {
    return useMutation({
        mutationFn: endSession,
        
      })
}