import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { getServerClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import type { MilkLog } from "@/types";

const TABLE = "milk_logs";

/** Baris baru yang akan disimpan (tanpa id & created_at) */
export type NewMilkLog = Omit<MilkLog, "id" | "created_at">;

export type DataMode = "supabase" | "local";

export function getDataMode(): DataMode {
  return isSupabaseConfigured ? "supabase" : "local";
}

// ---------------------------------------------------------------------------
// Local JSON store (fallback saat Supabase belum dikonfigurasi)
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "milk_logs.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const SETTINGS_TABLE = "app_settings";
const SETTINGS_ID = "app";

interface AppSettings {
  child_name?: string;
}

async function readSettings(): Promise<AppSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as AppSettings) : {};
  } catch {
    return {};
  }
}

async function writeSettings(settings: AppSettings): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf8");
}

async function readLocal(): Promise<MilkLog[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MilkLog[]) : [];
  } catch {
    return [];
  }
}

async function writeLocal(logs: MilkLog[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(logs, null, 2), "utf8");
}

// ---------------------------------------------------------------------------
// Public repository API — otomatis memilih Supabase atau local store
// ---------------------------------------------------------------------------

/** Feeding terakhir berdasarkan actual_time */
export async function lastFeeding(): Promise<MilkLog | null> {
  if (getDataMode() === "supabase") {
    const supabase = getServerClient()!;
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

  const logs = await readLocal();
  if (logs.length === 0) return null;
  return logs.reduce((latest, l) =>
    new Date(l.actual_time) > new Date(latest.actual_time) ? l : latest
  );
}

/** Semua log dalam rentang [startIso, endIso), terurut naik */
export async function logsByRange(
  startIso: string,
  endIso: string
): Promise<MilkLog[]> {
  if (getDataMode() === "supabase") {
    const supabase = getServerClient()!;
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

  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  const logs = await readLocal();
  return logs
    .filter((l) => {
      const t = new Date(l.actual_time).getTime();
      return t >= start && t < end;
    })
    .sort(
      (a, b) =>
        new Date(a.actual_time).getTime() - new Date(b.actual_time).getTime()
    );
}

/** Simpan satu baris baru. Kembalikan pesan error atau null bila sukses. */
export async function insertLog(row: NewMilkLog): Promise<string | null> {
  if (getDataMode() === "supabase") {
    const supabase = getServerClient()!;
    const { error } = await supabase.from(TABLE).insert(row);
    if (error) {
      console.error("insertLog:", error.message);
      return error.message;
    }
    return null;
  }

  const logs = await readLocal();
  const full: MilkLog = {
    ...row,
    id: randomUUID(),
    created_at: new Date().toISOString(),
  };
  logs.push(full);
  await writeLocal(logs);
  return null;
}

/** Perbarui satu baris berdasarkan id. Kembalikan pesan error atau null bila sukses. */
export async function updateLog(
  id: string,
  patch: NewMilkLog
): Promise<string | null> {
  if (getDataMode() === "supabase") {
    const supabase = getServerClient()!;
    const { error } = await supabase.from(TABLE).update(patch).eq("id", id);
    if (error) {
      console.error("updateLog:", error.message);
      return error.message;
    }
    return null;
  }

  const logs = await readLocal();
  const idx = logs.findIndex((l) => l.id === id);
  if (idx === -1) return "Data tidak ditemukan.";
  logs[idx] = { ...logs[idx], ...patch }; // id & created_at dipertahankan
  await writeLocal(logs);
  return null;
}

/** Hapus satu baris berdasarkan id. Kembalikan pesan error atau null bila sukses. */
export async function deleteLog(id: string): Promise<string | null> {
  if (getDataMode() === "supabase") {
    const supabase = getServerClient()!;
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) {
      console.error("deleteLog:", error.message);
      return error.message;
    }
    return null;
  }

  const logs = await readLocal();
  const next = logs.filter((l) => l.id !== id);
  if (next.length === logs.length) return "Data tidak ditemukan.";
  await writeLocal(next);
  return null;
}

/** Hapus semua log. Kembalikan pesan error atau null bila sukses. */
export async function clearAll(): Promise<string | null> {
  if (getDataMode() === "supabase") {
    const supabase = getServerClient()!;
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .not("id", "is", null);
    return error ? error.message : null;
  }

  await writeLocal([]);
  return null;
}

// ---------------------------------------------------------------------------
// Pengaturan aplikasi — nama anak (disimpan sekali, dipakai terus)
// ---------------------------------------------------------------------------

/** Ambil nama anak yang tersimpan, atau null bila belum diatur */
export async function getChildName(): Promise<string | null> {
  if (getDataMode() === "supabase") {
    const supabase = getServerClient()!;
    const { data, error } = await supabase
      .from(SETTINGS_TABLE)
      .select("child_name")
      .eq("id", SETTINGS_ID)
      .maybeSingle();
    if (error) {
      console.error("getChildName:", error.message);
      return null;
    }
    const name = (data?.child_name as string | null)?.trim();
    return name && name.length > 0 ? name : null;
  }

  const settings = await readSettings();
  const name = settings.child_name?.trim();
  return name && name.length > 0 ? name : null;
}

/** Simpan nama anak. Kembalikan pesan error atau null bila sukses. */
export async function setChildName(name: string): Promise<string | null> {
  const clean = name.trim();
  if (clean.length === 0) return "Nama anak tidak boleh kosong.";

  if (getDataMode() === "supabase") {
    const supabase = getServerClient()!;
    const { error } = await supabase
      .from(SETTINGS_TABLE)
      .upsert({ id: SETTINGS_ID, child_name: clean }, { onConflict: "id" });
    if (error) {
      console.error("setChildName:", error.message);
      return error.message;
    }
    return null;
  }

  const settings = await readSettings();
  settings.child_name = clean;
  await writeSettings(settings);
  return null;
}
