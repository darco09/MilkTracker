import type { WeeklyReport } from "@/types";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Card, EmptyState } from "./ui";

export default function ReportView({ report }: { report: WeeklyReport }) {
  const rangeLabel = `${formatDate(`${report.rangeStart}T00:00:00+07:00`)} – ${formatDate(
    `${report.rangeEnd}T00:00:00+07:00`
  )}`;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{rangeLabel}</p>

      <div className="grid grid-cols-2 gap-3">
        <Metric label="Total intake" value={`${report.totalIntake} ml`} />
        <Metric label="Rata-rata / hari" value={`${report.averageIntake} ml`} />
        <Metric label="Jumlah feeding" value={`${report.feedingCount}x`} />
        <Metric
          label="Frekuensi retensi"
          value={`${report.retentionFrequency}x`}
        />
      </div>

      <Card>
        <p className="mb-3 text-sm font-semibold text-brand-800">
          Ringkasan feeding
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Summary
            label="Selesai"
            value={report.completedCount}
            tone="text-emerald-600"
          />
          <Summary
            label="Sebagian"
            value={report.partialCount}
            tone="text-amber-600"
          />
          <Summary
            label="Dilewati"
            value={report.skippedCount}
            tone="text-rose-600"
          />
        </div>
        <p className="mt-3 text-center text-xs text-gray-400">
          {report.daysCovered} hari tercatat
        </p>
      </Card>

      <div>
        <p className="mb-2 text-sm font-semibold text-brand-800">Catatan</p>
        {report.notes.length === 0 ? (
          <EmptyState message="Tidak ada catatan pada minggu ini." />
        ) : (
          <ul className="space-y-2">
            {report.notes.map((note, i) => (
              <li
                key={i}
                className="rounded-xl border border-brand-100 bg-white p-3 text-sm"
              >
                <p className="text-xs text-gray-400">
                  {formatDateTime(note.time)}
                </p>
                <p className="mt-1 text-gray-700">{note.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-brand-800">{value}</p>
    </div>
  );
}

function Summary({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-xl bg-brand-50 py-3">
      <p className={`text-2xl font-bold ${tone}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
