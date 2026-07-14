"use client";

import { useRouter } from "next/navigation";
import { todayKey, yesterdayKey } from "@/lib/utils";

export default function HistoryNav({ selected }: { selected: string }) {
  const router = useRouter();
  const today = todayKey();
  const yesterday = yesterdayKey();

  function go(dateKey: string) {
    router.push(`/history?date=${dateKey}`);
  }

  const tabs = [
    { key: today, label: "Hari ini" },
    { key: yesterday, label: "Kemarin" },
  ];

  return (
    <div className="mb-4 space-y-3">
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => go(tab.key)}
            className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
              selected === tab.key
                ? "border-brand-500 bg-brand-500 text-white"
                : "border-brand-200 bg-white text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-brand-200 bg-white px-4 py-2.5">
        <span className="text-sm font-medium text-gray-500">Pilih tanggal</span>
        <input
          type="date"
          value={selected}
          max={today}
          onChange={(e) => e.target.value && go(e.target.value)}
          className="ml-auto bg-transparent text-sm text-brand-700 outline-none"
        />
      </label>
    </div>
  );
}
