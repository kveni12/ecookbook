import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { ImportPanel } from "@/components/recipes/import-panel";
import { RecipeEditor } from "@/components/recipes/recipe-editor";
import { AppShell } from "@/components/layout/app-shell";
import { CreateSpaceCard } from "@/components/spaces/create-space-card";
import { getDashboardData } from "@/lib/data";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <AppShell user={data.user}>
      <div className="space-y-6">
        <DashboardOverview data={data} />
        <div className="grid gap-6 xl:grid-cols-2">
          <RecipeEditor spaces={data.spaces} />
          <ImportPanel spaces={data.spaces} />
        </div>
        <CreateSpaceCard />
      </div>
    </AppShell>
  );
}
