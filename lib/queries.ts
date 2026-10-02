import { getSettings, lastFeeding, logsByRange } from "./repository";
import { dayRangeUtc, toDateKey, weekRangeUtc } from "./utils";
import type { DailyProgress, MilkLog, WeeklyReport } from "@/types";

/** Ambil feeding terakhir (berdasarkan actual_time) */
export async function getLastFeeding(): Promise<MilkLog | null> {
  return lastFeeding();
}

/** Semua log pada satu date key "YYYY-MM-DD" (WIB), terurut naik */
export async function getLogsByDate(dateKey: string): Promise<MilkLog[]> {
  const { start, end } = dayRangeUtc(dateKey);
  return logsByRange(start, end);
}

/** Progress harian untuk sebuah date key */
export async function getDailyProgress(dateKey: string): Promise<DailyProgress> {
  const [logs, settings] = await Promise.all([
    getLogsByDate(dateKey),
    getSettings(),
  ]);
  const dailyTarget = settings.volume_target * settings.feedings_per_day;
  const totalActual = logs.reduce((sum, l) => sum + (l.volume_actual ?? 0), 0);
  const completedCount = logs.filter((l) => l.feeding_status === "completed").length;
  const partialCount = logs.filter((l) => l.feeding_status === "partial").length;
  const skippedCount = logs.filter((l) => l.feeding_status === "skipped").length;
  const percent = Math.min(100, Math.round((totalActual / dailyTarget) * 100));
  return {
    totalActual,
    target: dailyTarget,
    percent,
    feedingCount: logs.length,
    completedCount,
    partialCount,
    skippedCount,
  };
}

/** Laporan mingguan mulai dari date key Senin */
export async function getWeeklyReport(mondayKey: string): Promise<WeeklyReport> {
  const { start, end } = weekRangeUtc(mondayKey);
  const endKey = toDateKey(new Date(new Date(end).getTime() - 1));
  const logs = await logsByRange(start, end);

  const totalIntake = logs.reduce((sum, l) => sum + (l.volume_actual ?? 0), 0);
  const daysCovered = new Set(logs.map((l) => toDateKey(l.actual_time))).size;
  const notes = logs
    .filter((l) => l.notes && l.notes.trim().length > 0)
    .map((l) => ({ time: l.actual_time, text: l.notes as string }));

  return {
    rangeStart: mondayKey,
    rangeEnd: endKey,
    totalIntake,
    averageIntake: daysCovered > 0 ? Math.round(totalIntake / daysCovered) : 0,
    feedingCount: logs.length,
    completedCount: logs.filter((l) => l.feeding_status === "completed").length,
    partialCount: logs.filter((l) => l.feeding_status === "partial").length,
    skippedCount: logs.filter((l) => l.feeding_status === "skipped").length,
    retentionFrequency: logs.filter((l) => l.retention_checked).length,
    daysCovered,
    notes,
  };
}
