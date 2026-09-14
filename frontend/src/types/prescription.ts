export interface PrescriptionPage {
  id: number;
  file_url: string;
  file_type: string;
  page_number: int;
  original_filename: string | null;
  file_size_bytes: number | null;
}

export interface Prescription {
  id: number;
  user_id: number;
  status: "uploaded" | "processing" | "completed" | "failed";
  uploaded_at: string;
  processed_at: string | null;
  pages: PrescriptionPage[];
}

export interface PrescriptionListResponse {
  id: number;
  status: "uploaded" | "processing" | "completed" | "failed";
  uploaded_at: string;
  page_count: number;
}
