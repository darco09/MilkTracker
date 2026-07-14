import { getDailyProgress, getLastFeeding } from "@/lib/queries";
import { getChildName } from "@/lib/repository";
import { getServerClient } from "@/lib/supabase/server";
import { todayKey } from "@/lib/utils";
import { PageHeader } from "@/components/ui";
import DailyProgressCard from "@/components/DailyProgressCard";
import CountdownCard from "@/components/CountdownCard";
import EditableLastFeeding from "@/components/EditableLastFeeding";
import FeedingForm from "@/components/FeedingForm";
import Onboarding from "@/components/Onboarding";
import ChildNameBar from "@/components/ChildNameBar";
import SignOutButton from "@/components/SignOutButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const childName = await getChildName();

  if (!childName) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">{user?.email}</span>
          <SignOutButton />
        </div>
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
      <div className="flex items-start justify-between">
        <PageHeader title="LittleCare" subtitle="Pantau feeding NGT harian" />
        <SignOutButton />
      </div>

      <ChildNameBar name={childName} email={user?.email ?? ""} />
      <DailyProgressCard progress={progress} />
      <CountdownCard nextTime={lastFeeding?.next_time ?? null} />
      <EditableLastFeeding log={lastFeeding} />
      <FeedingForm />
    </div>
  );
}
