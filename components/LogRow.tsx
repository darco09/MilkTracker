"use client";

import { useState } from "react";
import { updateFeeding } from "@/lib/actions";
import { formatTime } from "@/lib/utils";
import type { MilkLog } from "@/types";
import { StatusBadge } from "./ui";
import FeedingFormCore, { logToFormValues } from "./FeedingFormCore";
import DeleteFeedingButton from "./DeleteFeedingButton";

export default function LogRow({ log }: { log: MilkLog }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="rounded-2xl border border-brand-200 bg-white p-4 shadow-sm">
        <p className="mb-4 text-sm font-bold text-brand-800">Edit Feeding</p>
        <FeedingFormCore
          initial={logToFormValues(log)}
          hiddenId={log.id}
          submitLabel="Simpan Perubahan"
          pendingLabel="Menyimpan..."
          onSubmit={updateFeeding}
          onCancel={() => setEditing(false)}
          onDone={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-brand-800">
            {formatTime(log.actual_time)}
          </span>
          <span className="text-sm text-gray-400">
            → {formatTime(log.next_time)}
          </span>
        </div>
        <StatusBadge status={log.feeding_status} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
        <span>
          <span className="font-semibold text-brand-700">
            {log.volume_actual} ml
          </span>{" "}
          / {log.volume_target} ml
        </span>
        {log.retention_checked && (
          <span className="text-gray-500">
            Retensi {log.retention_volume ?? 0} ml
          </span>
        )}
      </div>

      {log.feeding_status === "skipped" && log.skip_reason && (
        <p className="mt-2 rounded-lg bg-rose-50 px-3 py-1.5 text-xs text-rose-600">
          Alasan: {log.skip_reason}
        </p>
      )}
      {log.notes && (
        <p className="mt-2 text-xs text-gray-500">Catatan: {log.notes}</p>
      )}

      <div className="mt-3 flex gap-2 border-t border-brand-50 pt-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg border border-brand-300 bg-white px-4 py-1.5 text-xs font-semibold text-brand-700"
        >
          Edit
        </button>
        <DeleteFeedingButton
          id={log.id}
          className="rounded-lg border border-rose-200 bg-white px-4 py-1.5 text-xs font-semibold text-rose-600 disabled:opacity-60"
        />
      </div>
    </li>
  );
}
