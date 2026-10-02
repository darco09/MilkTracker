/**
 * Business rules dari PRD v1.2
 */
export const CHILD_NAME = "Ananda";

/**
 * Nilai default saat user belum pernah mengatur target feeding sendiri.
 * Nilai aktual yang dipakai aplikasi diambil dari tabel app_settings
 * (lihat lib/repository.ts -> getSettings), bisa diubah lewat halaman /settings.
 */

/** Target volume per sekali feeding (ml) */
export const DEFAULT_VOLUME_TARGET = 150;

/** Jumlah feeding per hari */
export const DEFAULT_FEEDINGS_PER_DAY = 8;

/** Estimasi durasi feeding (menit) */
export const FEEDING_DURATION_MINUTES = 90;

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
