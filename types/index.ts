export type FeedingStatus = "completed" | "partial" | "skipped";

/** Merepresentasikan satu baris di table `milk_logs` */
export interface MilkLog {
  id: string;
  child_name: string;
  target_time: string; // ISO timestamptz
  actual_time: string; // ISO timestamptz
  next_time: string; // ISO timestamptz
  volume_target: number;
  volume_actual: number;
  retention_checked: boolean;
  retention_volume: number | null;
  feeding_status: FeedingStatus;
  skip_reason: string | null;
  notes: string | null;
  created_at: string; // ISO timestamptz
}

/** Payload dari form feeding sebelum diproses menjadi MilkLog */
export interface FeedingFormInput {
  child_name: string;
  actual_time: string; // ISO local dari input datetime-local
  volume_actual: number;
  retention_checked: boolean;
  retention_volume: number | null;
  feeding_status: FeedingStatus;
  skip_reason: string | null;
  notes: string | null;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/** Ringkasan progress harian untuk dashboard */
export interface DailyProgress {
  totalActual: number;
  target: number;
  percent: number;
  feedingCount: number;
  completedCount: number;
  partialCount: number;
  skippedCount: number;
}

/** Ringkasan laporan mingguan */
export interface WeeklyReport {
  rangeStart: string;
  rangeEnd: string;
  totalIntake: number;
  averageIntake: number;
  feedingCount: number;
  completedCount: number;
  partialCount: number;
  skippedCount: number;
  retentionFrequency: number;
  daysCovered: number;
  notes: { time: string; text: string }[];
}
