import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { ImportStudio } from "@/components/recipes/import-studio";
import { AppShell } from "@/components/layout/app-shell";
import { CreateSpaceCard } from "@/components/spaces/create-space-card";
import { getDashboardData } from "@/lib/data";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <AppShell user={data.user}>
      <div className="space-y-6">
        <DashboardOverview data={data} />
        <ImportStudio spaces={data.spaces} />
        <CreateSpaceCard />
      </div>
    </AppShell>
  );
}
