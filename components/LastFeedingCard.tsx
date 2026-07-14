import type { MilkLog } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { Card, StatusBadge } from "./ui";

export default function LastFeedingCard({ log }: { log: MilkLog | null }) {
  if (!log) {
    return (
      <Card>
        <p className="text-sm font-medium text-gray-500">Feeding terakhir</p>
        <p className="mt-2 text-gray-400">Belum ada catatan feeding.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">Feeding terakhir</p>
        <StatusBadge status={log.feeding_status} />
      </div>
      <p className="mt-2 text-lg font-semibold text-brand-800">
        {log.volume_actual} ml
        <span className="text-sm font-normal text-gray-400">
          {" "}
          / {log.volume_target} ml
        </span>
      </p>
      <p className="mt-1 text-sm text-gray-500">{formatDateTime(log.actual_time)}</p>

      {log.retention_checked && (
        <p className="mt-2 text-xs text-gray-500">
          Retensi: {log.retention_volume ?? 0} ml
        </p>
      )}
      {log.feeding_status === "skipped" && log.skip_reason && (
        <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
          Alasan: {log.skip_reason}
        </p>
      )}
      {log.notes && (
        <p className="mt-2 text-xs text-gray-500">Catatan: {log.notes}</p>
      )}
    </Card>
  );
}
