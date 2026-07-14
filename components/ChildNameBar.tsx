"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveChildName } from "@/lib/actions";

export default function ChildNameBar({
  name,
  email,
}: {
  name: string;
  email?: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await saveChildName(value);
      if (res.ok) {
        setEditing(false);
        router.refresh();
      } else {
        setError(res.error ?? "Gagal menyimpan.");
      }
    });
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-brand-200 bg-white p-3">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          className="min-w-0 flex-1 rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending ? "..." : "Simpan"}
        </button>
        <button
          type="button"
          onClick={() => {
            setValue(name);
            setEditing(false);
            setError(null);
          }}
          className="rounded-lg border border-brand-200 px-3 py-2 text-sm text-gray-500"
        >
          Batal
        </button>
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-brand-100 bg-white px-4 py-3">
      <span className="flex min-w-0 flex-col">
        <span className="flex items-center gap-2 text-sm font-medium text-brand-800">
          <span aria-hidden="true">👶</span> {name}
        </span>
        {email && (
          <span className="truncate text-xs text-gray-400">{email}</span>
        )}
      </span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="shrink-0 text-sm font-semibold text-brand-600"
      >
        Ubah nama
      </button>
    </div>
  );
}
