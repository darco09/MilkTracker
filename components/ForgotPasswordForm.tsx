"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/auth-actions";

export default function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await forgotPassword(formData);
      if (res.ok) {
        setInfo("Link reset password sudah dikirim, cek email kamu.");
      } else {
        setError(res.error ?? "Terjadi kesalahan.");
      }
    });
  }

  return (
    <div className="flex min-h-[80vh] flex-col justify-center">
      <div className="mb-6 text-center">
        <p className="text-5xl">🔑</p>
        <h1 className="mt-3 text-2xl font-bold text-brand-800">Lupa Password</h1>
        <p className="mt-1 text-sm text-gray-500">
          Masukkan email untuk menerima link reset password
        </p>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="nama@email.com"
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
            {isPending ? "Memproses..." : "Kirim Link Reset"}
          </button>

          <Link
            href="/login"
            className="block text-center text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Kembali ke halaman login
          </Link>
        </form>
      </div>
    </div>
  );
}
