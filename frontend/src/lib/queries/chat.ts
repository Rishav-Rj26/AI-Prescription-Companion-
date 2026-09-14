import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { ChatSession, ChatMessage } from "@/types/chat";

export const useChatSessions = () => {
  return useQuery({
    queryKey: ["chat_sessions"],
    queryFn: async (): Promise<ChatSession[]> => {
      const { data } = await api.get("/chat/sessions");
      return data;
    },
  });
};

export const useChatSession = (id: number) => {
  return useQuery({
    queryKey: ["chat_sessions", id],
    queryFn: async (): Promise<ChatSession> => {
      const { data } = await api.get(`/chat/sessions/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateChatSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prescription_id: number): Promise<ChatSession> => {
      const { data } = await api.post("/chat/sessions", { prescription_id });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat_sessions"] });
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, content }: { sessionId: number, content: string }): Promise<ChatMessage> => {
      const { data } = await api.post(`/chat/sessions/${sessionId}/messages`, { content });
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chat_sessions", variables.sessionId] });
    },
  });
};
