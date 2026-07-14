"use server";

import { revalidatePath } from "next/cache";
import {
  clearAll,
  deleteLog,
  getChildName,
  insertLog,
  setChildName,
  updateLog,
  type NewMilkLog,
} from "./repository";
import { computeNextTime, localInputToIso, todayKey } from "./utils";
import { CHILD_NAME, VOLUME_TARGET } from "./constants";
import type { ActionResult, FeedingStatus } from "@/types";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/report");
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
  child_name: string
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
  const nextIso = computeNextTime(new Date(actualIso)).toISOString();

  return {
    row: {
      child_name,
      target_time: actualIso, // acuan jadwal = waktu mulai feeding
      actual_time: actualIso,
      next_time: nextIso,
      volume_target: VOLUME_TARGET,
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
  const childName = await getChildName();
  if (!childName) return { ok: false, error: "Nama anak belum diatur." };

  const parsed = parseFeedingForm(formData, childName);
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

  const childName = await getChildName();
  if (!childName) return { ok: false, error: "Nama anak belum diatur." };

  const parsed = parseFeedingForm(formData, childName);
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

/** Contoh data satu hari (untuk eksplorasi cepat di mode lokal) */
export async function seedSampleData(): Promise<ActionResult> {
  const today = todayKey();

  // pastikan ada nama anak untuk data contoh
  let childName = await getChildName();
  if (!childName) {
    await setChildName(CHILD_NAME);
    childName = CHILD_NAME;
  }

  const samples: {
    time: string;
    volume: number;
    status: FeedingStatus;
    retention?: number;
    skip_reason?: string;
    notes?: string;
  }[] = [
    { time: "06:00", volume: 120, status: "completed", retention: 12, notes: "Pagi lancar" },
    { time: "09:00", volume: 90, status: "partial", notes: "Agak rewel" },
    { time: "12:00", volume: 0, status: "skipped", skip_reason: "Anak muntah" },
    { time: "15:00", volume: 120, status: "completed", retention: 8 },
  ];

  for (const s of samples) {
    const actualIso = localInputToIso(`${today}T${s.time}`);
    const err = await insertLog({
      child_name: childName,
      target_time: actualIso,
      actual_time: actualIso,
      next_time: computeNextTime(new Date(actualIso)).toISOString(),
      volume_target: VOLUME_TARGET,
      volume_actual: s.volume,
      retention_checked: s.retention != null,
      retention_volume: s.retention ?? null,
      feeding_status: s.status,
      skip_reason: s.skip_reason ?? null,
      notes: s.notes ?? null,
    });
    if (err) return { ok: false, error: `Gagal seed: ${err}` };
  }

  revalidateAll();
  return { ok: true };
}

/** Hapus semua data */
export async function clearAllData(): Promise<ActionResult> {
  const err = await clearAll();
  if (err) return { ok: false, error: `Gagal menghapus: ${err}` };
  revalidateAll();
  return { ok: true };
}
