import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  preferred_language: string;
  is_admin: boolean;
  created_at: string;
}

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async (): Promise<User> => {
      const { data } = await api.get("/auth/me");
      return data;
    },
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: { preferred_language: string }): Promise<User> => {
      const { data } = await api.patch("/auth/settings", settings);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};
