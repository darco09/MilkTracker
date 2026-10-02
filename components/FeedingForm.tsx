"use client";

import { useState } from "react";
import { createFeeding } from "@/lib/actions";
import { isoToLocalInput } from "@/lib/utils";
import { Card } from "./ui";
import FeedingFormCore, { type FeedingFormValues } from "./FeedingFormCore";

function freshValues(volumeTarget: number): FeedingFormValues {
  return {
    actual_time: isoToLocalInput(new Date()),
    feeding_status: "completed",
    volume_actual: volumeTarget,
    retention_checked: false,
    retention_volume: null,
    skip_reason: null,
    notes: null,
  };
}

export default function FeedingForm({ volumeTarget }: { volumeTarget: number }) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!open) {
    return (
      <div>
        {success && (
          <div className="mb-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            ✓ Feeding berhasil dicatat.
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="touch-target flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 active:bg-brand-800"
        >
          <span className="text-xl leading-none">+</span> Catat Feeding
        </button>
      </div>
    );
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-800">Catat Feeding</h2>
      </div>
      <FeedingFormCore
        initial={freshValues(volumeTarget)}
        volumeTarget={volumeTarget}
        submitLabel="Simpan Feeding"
        pendingLabel="Menyimpan..."
        onSubmit={createFeeding}
        onCancel={() => setOpen(false)}
        onDone={() => {
          setOpen(false);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 2500);
        }}
      />
    </Card>
  );
}
