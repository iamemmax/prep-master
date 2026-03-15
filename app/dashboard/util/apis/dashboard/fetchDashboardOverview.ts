import { QUERYKEY } from "@/key/queryKey";
import { adminAxios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { dashbaordOverviewTypes } from "../../types/dashboard/dashbaordOverview";

export const getDashboardOverview = async () => {
  const response = await adminAxios.get(`/api/v1/prepmaster/student/dashboard/`);
  return response?.data as dashbaordOverviewTypes;
};

export const useGetDashboardOverview = () => {
  return useQuery({
    queryKey: QUERYKEY.DASHBOARD_OVERVIEW,
    queryFn: getDashboardOverview,
    staleTime: 1000 * 60,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};