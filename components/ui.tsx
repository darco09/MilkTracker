import { STATUS_COLOR, STATUS_LABEL } from "@/lib/constants";

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-5">
      <h1 className="text-2xl font-bold text-brand-800">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </header>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-brand-100 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        STATUS_COLOR[status] ?? "bg-gray-100 text-gray-600 border-gray-200"
      }`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-brand-200 bg-white/60 p-8 text-center text-sm text-gray-400">
      {message}
    </div>
  );
}
