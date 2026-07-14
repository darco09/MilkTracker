"use client";

import { useRouter } from "next/navigation";

export default function ReportNav({ week }: { week: string }) {
  const router = useRouter();
  const tabs = [
    { key: "this", label: "Minggu ini" },
    { key: "last", label: "Minggu lalu" },
  ];

  return (
    <div className="mb-4 flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => router.push(`/report?week=${tab.key}`)}
          className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
            week === tab.key
              ? "border-brand-500 bg-brand-500 text-white"
              : "border-brand-200 bg-white text-gray-600"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
