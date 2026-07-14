/**
 * Business rules dari PRD v1.2
 */
export const CHILD_NAME = "Ananda";

/** Target volume per sekali feeding (ml) */
export const VOLUME_TARGET = 120;

/** Target volume harian (ml) — 8 feeding x 120 ml */
export const DAILY_TARGET = 960;

/** Jarak antar feeding (jam) */
export const FEEDING_INTERVAL_HOURS = 3;

/** Estimasi durasi feeding (menit) */
export const FEEDING_DURATION_MINUTES = 90;

/** Jumlah feeding per hari */
export const FEEDINGS_PER_DAY = DAILY_TARGET / VOLUME_TARGET;

export const FEEDING_STATUS = {
  COMPLETED: "completed",
  PARTIAL: "partial",
  SKIPPED: "skipped",
} as const;

export const STATUS_LABEL: Record<string, string> = {
  completed: "Selesai",
  partial: "Sebagian",
  skipped: "Dilewati",
};

export const STATUS_COLOR: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  partial: "bg-amber-100 text-amber-700 border-amber-200",
  skipped: "bg-rose-100 text-rose-700 border-rose-200",
};

export const TIMEZONE = "Asia/Jakarta";
