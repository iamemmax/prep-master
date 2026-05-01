import { tokenlessAxios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { QUERYKEY } from "@/key/queryKey";

export interface CountryExam {
  id: number;
  reference: string;
  name: string;
  description: string;
  difficulty_level: string;
  is_premium: boolean;
  subject_count: number;
}

interface CountryExamsResponse {
  status: string;
  data: CountryExam[];
  message: string;
}

const getExams = async () => {
  const response = await tokenlessAxios.get<CountryExamsResponse>(
    `/api/v1/prep-master/exams/`
  );
  return response?.data;
};

export const useGetExamsByCountry = () => {
  return useQuery({
    queryKey: [QUERYKEY.SIGNUP_EXAMS_BY_COUNTRY],
    queryFn: getExams,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
