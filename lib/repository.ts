import { getServerClient } from "./supabase/server";
import { DEFAULT_FEEDINGS_PER_DAY, DEFAULT_VOLUME_TARGET } from "./constants";
import type { AppSettings, MilkLog } from "@/types";

const TABLE = "milk_logs";
const SETTINGS_TABLE = "app_settings";

/** Baris baru yang akan disimpan (id, user_id, created_at diisi oleh DB) */
export type NewMilkLog = Omit<MilkLog, "id" | "user_id" | "created_at">;

// Semua query di bawah otomatis ter-scope ke user yang login karena RLS
// (auth.uid() = user_id). Insert mengisi user_id via default auth.uid().

/** Feeding terakhir milik user (berdasarkan actual_time) */
export async function lastFeeding(): Promise<MilkLog | null> {
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("actual_time", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("lastFeeding:", error.message);
    return null;
  }
  return (data as MilkLog) ?? null;
}

/** Semua log dalam rentang [startIso, endIso), terurut naik */
export async function logsByRange(
  startIso: string,
  endIso: string
): Promise<MilkLog[]> {
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .gte("actual_time", startIso)
    .lt("actual_time", endIso)
    .order("actual_time", { ascending: true });
  if (error) {
    console.error("logsByRange:", error.message);
    return [];
  }
  return (data as MilkLog[]) ?? [];
}

/** Simpan satu baris baru. Kembalikan pesan error atau null bila sukses. */
export async function insertLog(row: NewMilkLog): Promise<string | null> {
  const supabase = await getServerClient();
  const { error } = await supabase.from(TABLE).insert(row);
  if (error) {
    console.error("insertLog:", error.message);
    return error.message;
  }
  return null;
}

/** Perbarui satu baris berdasarkan id (RLS memastikan hanya baris milik user). */
export async function updateLog(
  id: string,
  patch: NewMilkLog
): Promise<string | null> {
  const supabase = await getServerClient();
  const { error } = await supabase.from(TABLE).update(patch).eq("id", id);
  if (error) {
    console.error("updateLog:", error.message);
    return error.message;
  }
  return null;
}

/** Hapus satu baris berdasarkan id. */
export async function deleteLog(id: string): Promise<string | null> {
  const supabase = await getServerClient();
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) {
    console.error("deleteLog:", error.message);
    return error.message;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Pengaturan per user — nama anak
// ---------------------------------------------------------------------------

/** Nama anak milik user, atau null bila belum diatur */
export async function getChildName(): Promise<string | null> {
  const settings = await getSettings();
  return settings.child_name;
}

/** Seluruh pengaturan feeding milik user (nama anak, volume target, jumlah feeding/hari). */
export async function getSettings(): Promise<AppSettings> {
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .select("child_name, volume_target, feedings_per_day")
    .maybeSingle();
  if (error) {
    console.error("getSettings:", error.message);
  }
  const name = (data?.child_name as string | null)?.trim();
  return {
    child_name: name && name.length > 0 ? name : null,
    volume_target: data?.volume_target ?? DEFAULT_VOLUME_TARGET,
    feedings_per_day: data?.feedings_per_day ?? DEFAULT_FEEDINGS_PER_DAY,
  };
}

/** Simpan target volume & jumlah feeding/hari untuk user yang login. */
export async function saveSettings(input: {
  volume_target: number;
  feedings_per_day: number;
}): Promise<string | null> {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Sesi tidak valid. Silakan login ulang.";

  const { error } = await supabase.from(SETTINGS_TABLE).upsert(
    {
      user_id: user.id,
      volume_target: input.volume_target,
      feedings_per_day: input.feedings_per_day,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) {
    console.error("saveSettings:", error.message);
    return error.message;
  }
  return null;
}

/** Simpan nama anak untuk user yang login. */
export async function setChildName(name: string): Promise<string | null> {
  const clean = name.trim();
  if (clean.length === 0) return "Nama anak tidak boleh kosong.";

  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Sesi tidak valid. Silakan login ulang.";

  const { error } = await supabase
    .from(SETTINGS_TABLE)
    .upsert(
      { user_id: user.id, child_name: clean, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
  if (error) {
    console.error("setChildName:", error.message);
    return error.message;
  }
  return null;
}
