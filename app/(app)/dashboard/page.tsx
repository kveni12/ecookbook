import { CookbookLibrary } from "@/components/cookbooks/cookbook-library";
import { AppShell } from "@/components/layout/app-shell";
import { getDashboardData } from "@/lib/data";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <AppShell user={data.user}>
      <CookbookLibrary data={data} />
    </AppShell>
  );
}
