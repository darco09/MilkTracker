import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

/**
 * Client Supabase untuk dipakai di Server Components & Server Actions.
 * Aplikasi single-user tanpa login sehingga cukup anon key.
 * Kembalikan null bila belum dikonfigurasi agar UI bisa menampilkan panduan setup.
 */
export function getServerClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}
