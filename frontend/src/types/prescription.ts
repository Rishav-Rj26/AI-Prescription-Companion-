export interface PrescriptionPage {
  id: number;
  file_url: string;
  file_type: string;
  page_number: number;
  original_filename: string | null;
  file_size_bytes: number | null;
}

export interface PrescriptionMedicine {
  id: number;
  extracted_name: string;
  original_extracted_name: string | null;
  normalized_name: string | null;
  suggested_matches: string | null; // JSON string array
  strength: string | null;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  confidence_score: number | null;
  needs_verification: boolean;
  verified_by: number | null;
  verified_at: string | null;
}

export interface PrescriptionTest {
  id: number;
  test_name: string;
  description: string | null;
  confidence_score: number | null;
  needs_verification: boolean;
}

export interface Prescription {
  id: number;
  user_id: number;
  status: "uploaded" | "processing" | "completed" | "failed";
  failure_reason: string | null;
  confidence_score: number | null;
  needs_verification: boolean;
  uploaded_at: string;
  processed_at: string | null;
  pages: PrescriptionPage[];
  medicines: PrescriptionMedicine[];
  tests: PrescriptionTest[];
}

export interface PrescriptionListResponse {
  id: number;
  status: "uploaded" | "processing" | "completed" | "failed";
  uploaded_at: string;
  page_count: number;
  test_count?: number;
  medicines_summary?: string;
}
