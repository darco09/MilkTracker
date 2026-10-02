"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveFeedingSettings } from "@/lib/actions";
import { Card } from "./ui";

export default function FeedingSettingsForm({
  volumeTarget,
  feedingsPerDay,
}: {
  volumeTarget: number;
  feedingsPerDay: number;
}) {
  const router = useRouter();
  const [volume, setVolume] = useState(String(volumeTarget));
  const [feedings, setFeedings] = useState(String(feedingsPerDay));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const dailyTarget = useMemo(() => {
    const v = Number(volume);
    const f = Number(feedings);
    return Number.isFinite(v) && Number.isFinite(f) ? Math.max(0, v * f) : 0;
  }, [volume, feedings]);

  const intervalHours = useMemo(() => {
    const f = Number(feedings);
    return Number.isFinite(f) && f > 0 ? Math.round((24 / f) * 10) / 10 : 0;
  }, [feedings]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveFeedingSettings(formData);
      if (res.ok) {
        setSuccess(true);
        router.refresh();
      } else {
        setError(res.error ?? "Gagal menyimpan.");
      }
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-600">
            Volume per feeding (ml)
          </label>
          <input
            type="number"
            name="volume_target"
            min={1}
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            required
            inputMode="numeric"
            className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-base text-gray-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-600">
            Jumlah feeding per hari
          </label>
          <input
            type="number"
            name="feedings_per_day"
            min={1}
            max={24}
            value={feedings}
            onChange={(e) => setFeedings(e.target.value)}
            required
            inputMode="numeric"
            className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-base text-gray-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <p className="mt-1 text-xs text-gray-400">
            Jarak antar feeding otomatis: ~{intervalHours} jam
          </p>
        </div>

        <div className="rounded-xl bg-brand-50/60 px-4 py-3 text-sm text-brand-800">
          Target harian: <span className="font-bold">{dailyTarget} ml</span>
        </div>

        {error && (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            ✓ Pengaturan tersimpan.
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="touch-target flex w-full items-center justify-center rounded-2xl bg-brand-600 text-base font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {isPending ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
      </form>
    </Card>
  );
}
