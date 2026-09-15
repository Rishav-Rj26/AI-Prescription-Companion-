export interface MedicineSummary {
  id: number;
  name: string;
  strength: string | null;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
}

export interface MedicineDiffItem {
  medicine_name: string;
  strength_a: string | null;
  strength_b: string | null;
  dosage_a: string | null;
  dosage_b: string | null;
  frequency_a: string | null;
  frequency_b: string | null;
  duration_a: string | null;
  duration_b: string | null;
}

export interface CompareResponse {
  prescription_a_id: number;
  prescription_b_id: number;
  added: MedicineSummary[];
  removed: MedicineSummary[];
  changed: MedicineDiffItem[];
  unchanged: MedicineSummary[];
}
