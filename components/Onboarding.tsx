"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveChildName } from "@/lib/actions";
import { Card } from "./ui";

export default function Onboarding() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (name.trim().length === 0) {
      setError("Nama anak wajib diisi.");
      return;
    }
    startTransition(async () => {
      const res = await saveChildName(name);
      if (res.ok) router.refresh();
      else setError(res.error ?? "Gagal menyimpan.");
    });
  }

  return (
    <div className="flex min-h-[70vh] flex-col justify-center">
      <div className="mb-6 text-center">
        <p className="text-5xl">🍼</p>
        <h1 className="mt-3 text-2xl font-bold text-brand-800">
          Selamat datang di LittleCare
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Isi nama anak dulu, cukup sekali. Nanti nggak perlu ngisi lagi tiap
          catat feeding.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-600">
              Nama anak
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
              placeholder="cth: Ananda"
              className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-base text-gray-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="touch-target flex w-full items-center justify-center rounded-2xl bg-brand-600 text-base font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {isPending ? "Menyimpan..." : "Mulai"}
          </button>
        </form>
      </Card>
    </div>
  );
}
