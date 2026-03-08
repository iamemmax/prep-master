import { User } from "@/context/authentication";
import { QUERYKEY } from "@/key/queryKey";
import { adminAxios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";





export const getAuthenticatedUser = async () => {
  const response = await adminAxios.get(`/api/v1/examiners/me`);
  return response?.data as User;
};

export const useUser = () =>{
  useQuery({
    queryKey:QUERYKEY.USER_DETAIL,
    queryFn: getAuthenticatedUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
