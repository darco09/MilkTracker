import type { MilkLog } from "@/types";
import { EmptyState } from "./ui";
import LogRow from "./LogRow";

export default function LogList({ logs }: { logs: MilkLog[] }) {
  if (logs.length === 0) {
    return <EmptyState message="Belum ada catatan feeding pada tanggal ini." />;
  }

  return (
    <ul className="space-y-3">
      {logs.map((log) => (
        <LogRow key={log.id} log={log} />
      ))}
    </ul>
  );
}
