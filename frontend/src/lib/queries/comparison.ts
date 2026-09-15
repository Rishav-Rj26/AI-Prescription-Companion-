import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { CompareResponse } from "@/types/comparison";

export const useComparePrescriptions = () => {
  return useMutation({
    mutationFn: async ({ id_a, id_b }: { id_a: number; id_b: number }): Promise<CompareResponse> => {
      const { data } = await api.post("/prescriptions/compare", {
        prescription_id_a: id_a,
        prescription_id_b: id_b,
      });
      return data;
    },
  });
};
