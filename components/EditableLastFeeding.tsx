"use client";

import { useState } from "react";
import { updateFeeding } from "@/lib/actions";
import type { MilkLog } from "@/types";
import { Card } from "./ui";
import LastFeedingCard from "./LastFeedingCard";
import FeedingFormCore, { logToFormValues } from "./FeedingFormCore";
import DeleteFeedingButton from "./DeleteFeedingButton";

export default function EditableLastFeeding({ log }: { log: MilkLog | null }) {
  const [editing, setEditing] = useState(false);

  if (!log) return <LastFeedingCard log={null} />;

  if (editing) {
    return (
      <Card>
        <h2 className="mb-4 text-lg font-bold text-brand-800">Edit Feeding</h2>
        <FeedingFormCore
          initial={logToFormValues(log)}
          hiddenId={log.id}
          submitLabel="Simpan Perubahan"
          pendingLabel="Menyimpan..."
          onSubmit={updateFeeding}
          onCancel={() => setEditing(false)}
          onDone={() => setEditing(false)}
        />
      </Card>
    );
  }

  return (
    <div>
      <LastFeedingCard log={log} />
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex-1 rounded-xl border border-brand-300 bg-white py-2.5 text-sm font-semibold text-brand-700"
        >
          Edit
        </button>
        <DeleteFeedingButton
          id={log.id}
          className="flex-1 rounded-xl border border-rose-200 bg-white py-2.5 text-sm font-semibold text-rose-600 disabled:opacity-60"
        />
      </div>
    </div>
  );
}
