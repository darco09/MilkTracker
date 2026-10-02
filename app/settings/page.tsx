import { getSettings } from "@/lib/repository";
import { PageHeader } from "@/components/ui";
import FeedingSettingsForm from "@/components/FeedingSettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <PageHeader title="Pengaturan" subtitle="Atur target feeding harian" />
      <FeedingSettingsForm
        volumeTarget={settings.volume_target}
        feedingsPerDay={settings.feedings_per_day}
      />
    </div>
  );
}
