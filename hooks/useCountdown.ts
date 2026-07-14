"use client";

import { useEffect, useState } from "react";

export interface CountdownState {
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isOverdue: boolean;
}

/**
 * Menghitung sisa waktu menuju `target` (ISO string) dan diperbarui tiap detik.
 * Bila sudah lewat, isOverdue = true dan angka menunjukkan berapa lama terlewat.
 */
export function useCountdown(target: string | null): CountdownState | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!target) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!target || now === null) return null;

  const diff = new Date(target).getTime() - now;
  const isOverdue = diff < 0;
  const abs = Math.abs(diff);
  const hours = Math.floor(abs / (1000 * 60 * 60));
  const minutes = Math.floor((abs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((abs % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, totalMs: diff, isOverdue };
}
