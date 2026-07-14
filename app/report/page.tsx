import { getWeeklyReport } from "@/lib/queries";
import { weekStartKey } from "@/lib/utils";
import { PageHeader } from "@/components/ui";
import ReportNav from "@/components/ReportNav";
import ReportView from "@/components/ReportView";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const selected = week === "last" ? "last" : "this";
  const mondayKey = weekStartKey(new Date(), selected === "last" ? -1 : 0);
  const report = await getWeeklyReport(mondayKey);

  return (
    <div>
      <PageHeader title="Laporan" subtitle="Ringkasan mingguan" />

      <ReportNav week={selected} />
      <ReportView report={report} />
    </div>
  );
}
