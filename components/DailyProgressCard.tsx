import type { DailyProgress } from "@/types";
import { Card } from "./ui";

export default function DailyProgressCard({
  progress,
}: {
  progress: DailyProgress;
}) {
  const { totalActual, target, percent, feedingCount } = progress;

  return (
    <Card>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Progress hari ini</p>
          <p className="mt-1 text-3xl font-bold text-brand-800">
            {totalActual}
            <span className="text-lg font-medium text-gray-400"> / {target} ml</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-brand-600">{percent}%</p>
          <p className="text-xs text-gray-400">{feedingCount}x feeding</p>
        </div>
      </div>

      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-brand-100">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Selesai" value={progress.completedCount} tone="text-emerald-600" />
        <Stat label="Sebagian" value={progress.partialCount} tone="text-amber-600" />
        <Stat label="Dilewati" value={progress.skippedCount} tone="text-rose-600" />
      </div>
    </Card>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-xl bg-brand-50 py-2">
      <p className={`text-xl font-bold ${tone}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
