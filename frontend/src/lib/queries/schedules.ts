import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Schedule, ScheduleListResponse, ScheduleUpdateRequest } from "@/types/schedule";

export const useSchedules = (date?: string) => {
  return useQuery({
    queryKey: ["schedules", date],
    queryFn: async (): Promise<ScheduleListResponse> => {
      const params = date ? { date } : {};
      const { data } = await api.get("/schedules", { params });
      return data;
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: ScheduleUpdateRequest }): Promise<Schedule> => {
      const { data } = await api.patch(`/schedules/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
};

export const useGenerateSchedules = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prescriptionId: number) => {
      const { data } = await api.post(`/schedules/generate/${prescriptionId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
};
