"use server";

import { getServerClient } from "./supabase/server";
import type { ActionResult } from "@/types";

function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  return { email, password };
}

/** Login dengan email + password */
export async function signIn(formData: FormData): Promise<ActionResult> {
  const { email, password } = readCredentials(formData);
  if (!email || !password) {
    return { ok: false, error: "Email dan password wajib diisi." };
  }

  const supabase = await getServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, error: "Email atau password salah." };
  }
  return { ok: true };
}

/** Daftar akun baru */
export async function signUp(formData: FormData): Promise<ActionResult> {
  const { email, password } = readCredentials(formData);
  if (!email || !password) {
    return { ok: false, error: "Email dan password wajib diisi." };
  }
  if (password.length < 6) {
    return { ok: false, error: "Password minimal 6 karakter." };
  }

  const supabase = await getServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return { ok: false, error: error.message };
  }
  // Bila konfirmasi email aktif, session belum terbentuk
  if (!data.session) {
    return {
      ok: false,
      error: "Cek email untuk konfirmasi akun, lalu login.",
    };
  }
  return { ok: true };
}

/** Logout */
export async function signOut(): Promise<ActionResult> {
  const supabase = await getServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
