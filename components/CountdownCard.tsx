"use client";

import { useCountdown } from "@/hooks/useCountdown";
import { formatTime } from "@/lib/utils";
import { Card } from "./ui";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function CountdownCard({ nextTime }: { nextTime: string | null }) {
  const cd = useCountdown(nextTime);

  if (!nextTime) {
    return (
      <Card className="text-center">
        <p className="text-sm text-gray-500">Feeding berikutnya</p>
        <p className="mt-2 text-lg font-semibold text-gray-400">
          Belum ada jadwal
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Catat feeding pertama untuk memulai countdown.
        </p>
      </Card>
    );
  }

  const overdue = cd?.isOverdue ?? false;

  return (
    <Card
      className={
        overdue ? "border-rose-200 bg-rose-50" : "border-brand-200 bg-brand-50"
      }
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">
          {overdue ? "Sudah lewat jadwal" : "Feeding berikutnya"}
        </p>
        <span
          className={`text-sm font-semibold ${
            overdue ? "text-rose-600" : "text-brand-600"
          }`}
        >
          {formatTime(nextTime)}
        </span>
      </div>

      <div
        className={`mt-3 text-center font-mono text-4xl font-bold tabular-nums ${
          overdue ? "text-rose-600" : "text-brand-700"
        }`}
        suppressHydrationWarning
      >
        {cd
          ? `${overdue ? "-" : ""}${pad(cd.hours)}:${pad(cd.minutes)}:${pad(
              cd.seconds
            )}`
          : "--:--:--"}
      </div>
      <p className="mt-2 text-center text-xs text-gray-500">
        {overdue
          ? "Segera lakukan feeding berikutnya."
          : "Waktu tersisa menuju feeding berikutnya."}
      </p>
    </Card>
  );
}
