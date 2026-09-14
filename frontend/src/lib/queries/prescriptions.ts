import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Prescription, PrescriptionListResponse } from "@/types/prescription";

export const usePrescriptions = () => {
  return useQuery({
    queryKey: ["prescriptions"],
    queryFn: async (): Promise<PrescriptionListResponse[]> => {
      const { data } = await api.get("/prescriptions");
      return data;
    },
  });
};

export const usePrescription = (id: number) => {
  return useQuery({
    queryKey: ["prescriptions", id],
    queryFn: async (): Promise<Prescription> => {
      const { data } = await api.get(`/prescriptions/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useUploadPrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]): Promise<Prescription> => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const { data } = await api.post("/prescriptions/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
    },
  });
};

export const useDeletePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/prescriptions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
    },
  });
};

export const useProcessPrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<Prescription> => {
      const { data } = await api.post(`/prescriptions/${id}/process`);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["prescriptions", variables] });
    },
  });
};
