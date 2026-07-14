import { getLogsByDate } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDate, todayKey } from "@/lib/utils";
import { PageHeader, SetupNotice } from "@/components/ui";
import HistoryNav from "@/components/HistoryNav";
import LogList from "@/components/LogList";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const selected = date && DATE_RE.test(date) ? date : todayKey();
  const logs = await getLogsByDate(selected);
  const total = logs.reduce((sum, l) => sum + (l.volume_actual ?? 0), 0);

  return (
    <div>
      <PageHeader title="Riwayat" subtitle={formatDate(`${selected}T00:00:00+07:00`)} />

      {!isSupabaseConfigured && <SetupNotice />}

      <HistoryNav selected={selected} />

      {logs.length > 0 && (
        <p className="mb-3 text-sm text-gray-500">
          {logs.length}x feeding •{" "}
          <span className="font-semibold text-brand-700">{total} ml</span> total
        </p>
      )}

      <LogList logs={logs} />
    </div>
  );
}
