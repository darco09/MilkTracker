"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/lib/auth-actions";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    startTransition(async () => {
      const res = await updatePassword(formData);
      if (res.ok) {
        setInfo("Password berhasil diubah. Mengalihkan...");
        setTimeout(() => {
          router.replace("/");
          router.refresh();
        }, 1200);
      } else {
        setError(res.error ?? "Terjadi kesalahan.");
      }
    });
  }

  return (
    <div className="flex min-h-[80vh] flex-col justify-center">
      <div className="mb-6 text-center">
        <p className="text-5xl">🔑</p>
        <h1 className="mt-3 text-2xl font-bold text-brand-800">Reset Password</h1>
        <p className="mt-1 text-sm text-gray-500">Buat password baru untuk akunmu</p>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-600">
              Password Baru
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Minimal 6 karakter"
              className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-600">
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Ulangi password baru"
              className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="touch-target flex w-full items-center justify-center rounded-2xl bg-brand-600 text-base font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {isPending ? "Memproses..." : "Simpan Password Baru"}
          </button>
        </form>
      </div>
    </div>
  );
}
