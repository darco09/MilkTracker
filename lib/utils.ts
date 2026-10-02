import { TIMEZONE } from "./constants";

/** Tambahkan jam ke sebuah Date dan kembalikan Date baru */
export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

/** next_time = actual_time + jarak antar feeding (24 jam / jumlah feeding per hari) */
export function computeNextTime(actualTime: Date, feedingsPerDay: number): Date {
  return addHours(actualTime, 24 / feedingsPerDay);
}

/** Format jam:menit, contoh "14:30" (WIB) */
export function formatTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE,
  }).format(d);
}

/** Format tanggal panjang, contoh "Senin, 14 Jul 2026" (WIB) */
export function formatDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TIMEZONE,
  }).format(d);
}

/** Format tanggal + jam */
export function formatDateTime(iso: string | Date): string {
  return `${formatDate(iso)} • ${formatTime(iso)}`;
}

/**
 * Kembalikan string "YYYY-MM-DD" dari sebuah Date pada zona waktu WIB.
 * Dipakai untuk mengelompokkan log per hari.
 */
export function toDateKey(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  // en-CA menghasilkan format YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: TIMEZONE,
  }).format(d);
}

/**
 * Batas awal (00:00 WIB) dan akhir (24:00 WIB) untuk sebuah date key "YYYY-MM-DD".
 * Kembalikan ISO string UTC untuk dipakai di query range Supabase.
 * WIB = UTC+7, jadi 00:00 WIB = 17:00 UTC hari sebelumnya.
 */
export function dayRangeUtc(dateKey: string): { start: string; end: string } {
  const start = new Date(`${dateKey}T00:00:00+07:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

/** Date key hari ini (WIB) */
export function todayKey(): string {
  return toDateKey(new Date());
}

/** Date key kemarin (WIB) */
export function yesterdayKey(): string {
  const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return toDateKey(d);
}

/**
 * Kembalikan date key Senin dari minggu yang memuat `ref` (WIB),
 * lalu offset minggu (0 = minggu ini, -1 = minggu lalu).
 */
export function weekStartKey(ref: Date, weekOffset = 0): string {
  const key = toDateKey(ref);
  const base = new Date(`${key}T00:00:00+07:00`);
  const day = base.getUTCDay(); // 0=Min ... 1=Sen (dihitung pada instant 00:00 WIB)
  const diffToMonday = (day + 6) % 7; // jarak mundur ke Senin
  const monday = new Date(
    base.getTime() - diffToMonday * 24 * 60 * 60 * 1000 + weekOffset * 7 * 24 * 60 * 60 * 1000
  );
  return toDateKey(monday);
}

/** Range UTC untuk 7 hari mulai dari date key Senin */
export function weekRangeUtc(mondayKey: string): { start: string; end: string } {
  const start = new Date(`${mondayKey}T00:00:00+07:00`);
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

/**
 * Konversi nilai input <input type="datetime-local"> (yang tak berzona,
 * dianggap WIB) menjadi ISO string UTC.
 */
export function localInputToIso(value: string): string {
  // value contoh "2026-07-14T14:30"
  return new Date(`${value}:00+07:00`).toISOString();
}

/** Konversi Date menjadi nilai default untuk <input type="datetime-local"> (WIB) */
export function isoToLocalInput(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: TIMEZONE,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function clampNonNegative(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}
