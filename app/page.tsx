import { getDailyProgress, getLastFeeding } from "@/lib/queries";
import { getChildName } from "@/lib/repository";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { todayKey } from "@/lib/utils";
import { PageHeader, SetupNotice } from "@/components/ui";
import DailyProgressCard from "@/components/DailyProgressCard";
import CountdownCard from "@/components/CountdownCard";
import EditableLastFeeding from "@/components/EditableLastFeeding";
import FeedingForm from "@/components/FeedingForm";
import DevPanel from "@/components/DevPanel";
import Onboarding from "@/components/Onboarding";
import ChildNameBar from "@/components/ChildNameBar";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const childName = await getChildName();

  if (!childName) {
    return (
      <div className="space-y-5">
        {!isSupabaseConfigured && <SetupNotice />}
        <Onboarding />
      </div>
    );
  }

  const [progress, lastFeeding] = await Promise.all([
    getDailyProgress(todayKey()),
    getLastFeeding(),
  ]);

  return (
    <div className="space-y-5">
      <PageHeader title="LittleCare" subtitle="Pantau feeding NGT harian" />

      {!isSupabaseConfigured && <SetupNotice />}

      <ChildNameBar name={childName} />
      <DailyProgressCard progress={progress} />
      <CountdownCard nextTime={lastFeeding?.next_time ?? null} />
      <EditableLastFeeding log={lastFeeding} />
      <FeedingForm />
      {!isSupabaseConfigured && <DevPanel />}
    </div>
  );
}
