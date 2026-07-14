"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-actions";

type Mode = "login" | "signup";

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const action = mode === "login" ? signIn : signUp;
      const res = await action(formData);
      if (res.ok) {
        router.replace("/");
        router.refresh();
      } else {
        setError(res.error ?? "Terjadi kesalahan.");
      }
    });
  }

  return (
    <div className="flex min-h-[80vh] flex-col justify-center">
      <div className="mb-6 text-center">
        <p className="text-5xl">🍼</p>
        <h1 className="mt-3 text-2xl font-bold text-brand-800">LittleCare</h1>
        <p className="mt-1 text-sm text-gray-500">
          {mode === "login"
            ? "Masuk untuk melanjutkan"
            : "Buat akun baru untuk mulai"}
        </p>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
        <div className="mb-5 grid grid-cols-2 gap-2">
          {(["login", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
                setInfo(null);
              }}
              className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                mode === m
                  ? "bg-brand-500 text-white"
                  : "bg-brand-50 text-gray-500"
              }`}
            >
              {m === "login" ? "Masuk" : "Daftar"}
            </button>
          ))}
        </div>

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
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="Minimal 6 karakter"
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
            {isPending
              ? "Memproses..."
              : mode === "login"
                ? "Masuk"
                : "Daftar"}
          </button>
        </form>
      </div>
    </div>
  );
}
