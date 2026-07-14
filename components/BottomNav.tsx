"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <path d="M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    ),
  },
  {
    href: "/history",
    label: "Riwayat",
    icon: (
      <>
        <path d="M12 8v4l3 2" />
        <path d="M3.05 11a9 9 0 1 1 .5 4" />
        <path d="M3 4v5h5" />
      </>
    ),
  },
  {
    href: "/report",
    label: "Laporan",
    icon: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Sembunyikan navigasi di halaman login
  if (pathname.startsWith("/login")) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-brand-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-md">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`touch-target flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors ${
                active ? "text-brand-600" : "text-gray-400"
              }`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {item.icon}
              </svg>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
