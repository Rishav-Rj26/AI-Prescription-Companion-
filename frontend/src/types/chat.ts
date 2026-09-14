export interface Citation {
  source_id: number;
  source_title: string;
  chunk_text: string;
}

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  citations: Citation[];
  created_at: string;
}

export interface ChatSession {
  id: number;
  prescription_id: number;
  title: string | null;
  created_at: string;
  messages: ChatMessage[];
}
