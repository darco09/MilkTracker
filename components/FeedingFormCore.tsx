"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { VOLUME_TARGET } from "@/lib/constants";
import { isoToLocalInput } from "@/lib/utils";
import type { ActionResult, FeedingStatus, MilkLog } from "@/types";

const STATUS_OPTIONS: { value: FeedingStatus; label: string }[] = [
  { value: "completed", label: "Selesai" },
  { value: "partial", label: "Sebagian" },
  { value: "skipped", label: "Dilewati" },
];

export interface FeedingFormValues {
  actual_time: string; // nilai untuk <input type="datetime-local">
  feeding_status: FeedingStatus;
  volume_actual: number;
  retention_checked: boolean;
  retention_volume: number | null;
  skip_reason: string | null;
  notes: string | null;
}

/** Konversi MilkLog menjadi nilai awal untuk form edit */
export function logToFormValues(log: MilkLog): FeedingFormValues {
  return {
    actual_time: isoToLocalInput(log.actual_time),
    feeding_status: log.feeding_status,
    volume_actual: log.volume_actual,
    retention_checked: log.retention_checked,
    retention_volume: log.retention_volume,
    skip_reason: log.skip_reason,
    notes: log.notes,
  };
}

export default function FeedingFormCore({
  initial,
  hiddenId,
  submitLabel,
  pendingLabel,
  onSubmit,
  onDone,
  onCancel,
}: {
  initial: FeedingFormValues;
  hiddenId?: string;
  submitLabel: string;
  pendingLabel: string;
  onSubmit: (fd: FormData) => Promise<ActionResult>;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<FeedingStatus>(initial.feeding_status);
  const [volume, setVolume] = useState<string>(String(initial.volume_actual));
  const [retentionChecked, setRetentionChecked] = useState(
    initial.retention_checked
  );
  const [error, setError] = useState<string | null>(null);

  const isSkipped = status === "skipped";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await onSubmit(formData);
      if (result.ok) {
        router.refresh();
        onDone();
      } else {
        setError(result.error ?? "Terjadi kesalahan.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {hiddenId && <input type="hidden" name="id" value={hiddenId} />}

      <Field label="Waktu mulai feeding">
        <input
          type="datetime-local"
          name="actual_time"
          defaultValue={initial.actual_time}
          required
          className="ff-input"
        />
      </Field>

      <Field label="Status feeding">
        <div className="grid grid-cols-3 gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => {
                setStatus(opt.value);
                if (opt.value === "skipped") setVolume("0");
                else if (volume === "0") setVolume(String(VOLUME_TARGET));
              }}
              className={`touch-target rounded-xl border text-sm font-semibold transition-colors ${
                status === opt.value
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-brand-200 bg-white text-gray-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="feeding_status" value={status} />
      </Field>

      {!isSkipped && (
        <Field label="Volume aktual (ml)">
          <input
            type="number"
            name="volume_actual"
            min={0}
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            required
            className="ff-input"
            inputMode="numeric"
          />
        </Field>
      )}

      {!isSkipped && (
        <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-3">
          <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              name="retention_checked"
              checked={retentionChecked}
              onChange={(e) => setRetentionChecked(e.target.checked)}
              className="h-5 w-5 rounded border-brand-300 text-brand-600"
            />
            Cek retensi lambung
          </label>
          {retentionChecked && (
            <div className="mt-3">
              <input
                type="number"
                name="retention_volume"
                min={0}
                max={volume || undefined}
                defaultValue={initial.retention_volume ?? ""}
                placeholder="Volume retensi (ml)"
                className="ff-input"
                inputMode="numeric"
              />
              <p className="mt-1 text-xs text-gray-400">
                Tidak boleh melebihi volume feeding.
              </p>
            </div>
          )}
        </div>
      )}

      {isSkipped && (
        <Field label="Alasan dilewati (wajib)">
          <textarea
            name="skip_reason"
            required
            rows={2}
            defaultValue={initial.skip_reason ?? ""}
            className="ff-input"
            placeholder="cth: anak muntah, jadwal dokter, dsb."
          />
        </Field>
      )}

      <Field label="Catatan (opsional)">
        <textarea
          name="notes"
          rows={2}
          defaultValue={initial.notes ?? ""}
          className="ff-input"
          placeholder="Catatan tambahan..."
        />
      </Field>

      {error && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="touch-target flex-1 rounded-2xl border border-brand-200 bg-white text-base font-semibold text-gray-600 disabled:opacity-60"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="touch-target flex-[2] rounded-2xl bg-brand-600 text-base font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {isPending ? pendingLabel : submitLabel}
        </button>
      </div>

      <style jsx>{`
        :global(.ff-input) {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--color-brand-200);
          background: white;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          color: #1f2937;
          outline: none;
        }
        :global(.ff-input:focus) {
          border-color: var(--color-brand-500);
          box-shadow: 0 0 0 3px var(--color-brand-100);
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-600">
        {label}
      </label>
      {children}
    </div>
  );
}
