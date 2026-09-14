export interface Schedule {
  id: number;
  prescription_medicine_id: number;
  scheduled_time: string;
  status: "pending" | "taken" | "skipped" | "snoozed";
  start_date: string;
  end_date: string;
  needs_review: boolean;
  review_reason: string | null;
  created_at: string;
  medicine_name: string | null;
  strength: string | null;
  dosage: string | null;
  day_number: number | null;
  total_days: number | null;
}

export interface ScheduleListResponse {
  date: string;
  schedules: Schedule[];
}

export interface ScheduleUpdateRequest {
  status?: "pending" | "taken" | "skipped" | "snoozed";
  scheduled_time?: string;
}
