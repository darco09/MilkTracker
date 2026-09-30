"use server";

import { headers } from "next/headers";
import { getServerClient } from "./supabase/server";
import type { ActionResult } from "@/types";

function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  return { email, password };
}

/** Ambil origin (protokol + host) dari request saat ini, untuk redirect email. */
async function getOrigin() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
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

/** Kirim email reset password */
export async function forgotPassword(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { ok: false, error: "Email wajib diisi." };
  }

  const supabase = await getServerClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });
  if (error) {
    return { ok: false, error: "Gagal mengirim email reset password." };
  }
  return { ok: true };
}

/** Set password baru (dipanggil setelah user klik link reset dari email) */
export async function updatePassword(formData: FormData): Promise<ActionResult> {
  const password = String(formData.get("password") ?? "");
  if (!password || password.length < 6) {
    return { ok: false, error: "Password minimal 6 karakter." };
  }

  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Sesi reset password tidak valid atau kedaluwarsa." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
