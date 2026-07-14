"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { clearAllData, seedSampleData } from "@/lib/actions";

export default function DevPanel() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) {
    setMsg(null);
    startTransition(async () => {
      const res = await fn();
      setMsg(res.ok ? ok : res.error ?? "Gagal.");
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-dashed border-brand-200 bg-white/60 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Alat mode lokal
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(seedSampleData, "Contoh data ditambahkan.")}
          className="flex-1 rounded-xl border border-brand-300 bg-brand-50 px-3 py-2.5 text-sm font-semibold text-brand-700 disabled:opacity-60"
        >
          Isi contoh data
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (confirm("Hapus semua data feeding?")) {
              run(clearAllData, "Semua data dihapus.");
            }
          }}
          className="flex-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-600 disabled:opacity-60"
        >
          Reset data
        </button>
      </div>
      {msg && <p className="mt-2 text-xs text-gray-500">{msg}</p>}
    </div>
  );
}
