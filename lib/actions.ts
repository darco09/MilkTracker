"use server";

import { revalidatePath } from "next/cache";
import {
  deleteLog,
  getSettings,
  insertLog,
  saveSettings,
  setChildName,
  updateLog,
  type NewMilkLog,
} from "./repository";
import { computeNextTime, localInputToIso } from "./utils";
import type { ActionResult, FeedingStatus } from "@/types";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/report");
  revalidatePath("/settings");
}

/** Validasi payload sesuai aturan PRD, kembalikan pesan error atau null bila valid */
function validate(input: {
  child_name: string;
  volume_actual: number;
  retention_checked: boolean;
  retention_volume: number | null;
  feeding_status: FeedingStatus;
  skip_reason: string | null;
}): string | null {
  if (!input.child_name || input.child_name.trim().length === 0) {
    return "Nama anak wajib diisi.";
  }
  if (!Number.isFinite(input.volume_actual) || input.volume_actual < 0) {
    return "Volume harus angka >= 0.";
  }
  if (
    input.retention_checked &&
    input.retention_volume != null &&
    input.retention_volume > input.volume_actual
  ) {
    return "Volume retensi tidak boleh melebihi volume feeding.";
  }
  if (input.feeding_status === "skipped") {
    if (input.volume_actual !== 0) {
      return "Feeding yang dilewati harus memiliki volume 0.";
    }
    if (!input.skip_reason || input.skip_reason.trim().length === 0) {
      return "Alasan wajib diisi bila feeding dilewati.";
    }
  }
  return null;
}

/** Parse & validasi FormData feeding menjadi baris siap simpan */
function parseFeedingForm(
  formData: FormData,
  child_name: string,
  volumeTarget: number,
  feedingsPerDay: number
): { error: string } | { row: NewMilkLog } {
  const actual_local = String(formData.get("actual_time") ?? "");
  const feeding_status = String(
    formData.get("feeding_status") ?? "completed"
  ) as FeedingStatus;
  const retention_checked = formData.get("retention_checked") === "on";

  const volume_actual =
    feeding_status === "skipped"
      ? 0
      : Math.max(0, Number(formData.get("volume_actual") ?? 0));
  const retention_volume_raw = formData.get("retention_volume");
  const retention_volume =
    retention_checked && retention_volume_raw != null && retention_volume_raw !== ""
      ? Math.max(0, Number(retention_volume_raw))
      : null;
  const skip_reason =
    feeding_status === "skipped"
      ? String(formData.get("skip_reason") ?? "").trim() || null
      : null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const validationError = validate({
    child_name,
    volume_actual,
    retention_checked,
    retention_volume,
    feeding_status,
    skip_reason,
  });
  if (validationError) return { error: validationError };

  if (!actual_local) return { error: "Waktu feeding wajib diisi." };

  const actualIso = localInputToIso(actual_local);
  const nextIso = computeNextTime(new Date(actualIso), feedingsPerDay).toISOString();

  return {
    row: {
      child_name,
      target_time: actualIso, // acuan jadwal = waktu mulai feeding
      actual_time: actualIso,
      next_time: nextIso,
      volume_target: volumeTarget,
      volume_actual,
      retention_checked,
      retention_volume,
      feeding_status,
      skip_reason,
      notes,
    },
  };
}

/** Server Action: simpan satu feeding baru ke milk_logs */
export async function createFeeding(formData: FormData): Promise<ActionResult> {
  const settings = await getSettings();
  if (!settings.child_name) return { ok: false, error: "Nama anak belum diatur." };

  const parsed = parseFeedingForm(
    formData,
    settings.child_name,
    settings.volume_target,
    settings.feedings_per_day
  );
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const error = await insertLog(parsed.row);
  if (error) return { ok: false, error: `Gagal menyimpan: ${error}` };

  revalidateAll();
  return { ok: true };
}

/** Server Action: perbarui feeding yang sudah ada (mis. koreksi volume/status) */
export async function updateFeeding(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "ID data tidak valid." };

  const settings = await getSettings();
  if (!settings.child_name) return { ok: false, error: "Nama anak belum diatur." };

  const parsed = parseFeedingForm(
    formData,
    settings.child_name,
    settings.volume_target,
    settings.feedings_per_day
  );
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const error = await updateLog(id, parsed.row);
  if (error) return { ok: false, error: `Gagal memperbarui: ${error}` };

  revalidateAll();
  return { ok: true };
}

/** Server Action: hapus satu feeding */
export async function deleteFeeding(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "ID data tidak valid." };
  const error = await deleteLog(id);
  if (error) return { ok: false, error: `Gagal menghapus: ${error}` };
  revalidateAll();
  return { ok: true };
}

/** Server Action: simpan nama anak (setup awal / ubah nama) */
export async function saveChildName(name: string): Promise<ActionResult> {
  const error = await setChildName(name);
  if (error) return { ok: false, error };
  revalidateAll();
  return { ok: true };
}

/** Server Action: simpan target volume per feeding & jumlah feeding per hari */
export async function saveFeedingSettings(formData: FormData): Promise<ActionResult> {
  const volumeTarget = Number(formData.get("volume_target"));
  const feedingsPerDay = Number(formData.get("feedings_per_day"));

  if (!Number.isFinite(volumeTarget) || volumeTarget <= 0) {
    return { ok: false, error: "Volume per feeding harus angka > 0." };
  }
  if (
    !Number.isFinite(feedingsPerDay) ||
    feedingsPerDay <= 0 ||
    feedingsPerDay > 24
  ) {
    return { ok: false, error: "Jumlah feeding per hari harus antara 1-24." };
  }

  const error = await saveSettings({
    volume_target: Math.round(volumeTarget),
    feedings_per_day: Math.round(feedingsPerDay),
  });
  if (error) return { ok: false, error };
  revalidateAll();
  return { ok: true };
}
