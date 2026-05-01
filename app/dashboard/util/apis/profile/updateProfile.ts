import { adminAxios } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERYKEY } from "@/key/queryKey";

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
}

const updateProfile = async (payload: UpdateProfilePayload) => {
  const response = await adminAxios.patch(`/api/v1/prep-master/me/profile/`, payload);
  return response?.data;
};

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERYKEY.USER_DETAIL });
    },
  });
};
