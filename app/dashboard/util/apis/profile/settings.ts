import { adminAxios } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERYKEY } from "@/key/queryKey";

export interface UserSettings {
  id: number;
  daily_study_reminder: boolean;
  weekly_report: boolean;
  product_updates: boolean;
  camera_feed: boolean;
  audio_cues: boolean;
  phone_detection: boolean;
  gaze_tracking: boolean;
}

interface SettingsResponse {
  status: string;
  data: UserSettings;
  message: string;
}

const getSettings = async () => {
  const response = await adminAxios.get<SettingsResponse>(`/api/v1/prep-master/me/settings/`);
  return response?.data;
};

export const useGetSettings = () => {
  return useQuery({
    queryKey: QUERYKEY.USER_SETTINGS,
    queryFn: getSettings,
    staleTime: 1000 * 60,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export type UpdateSettingsPayload = Partial<Omit<UserSettings, "id">>;

const updateSettings = async (payload: UpdateSettingsPayload) => {
  const response = await adminAxios.patch<SettingsResponse>(
    `/api/v1/prep-master/me/settings/`,
    payload
  );
  return response?.data;
};

export const useUpdateSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERYKEY.USER_SETTINGS });
    },
  });
};
