import { AppShell } from "@/components/layout/app-shell";
import { CookbookWorkspace } from "@/components/cookbooks/cookbook-workspace";
import { getCookbookById, getCurrentUser } from "@/lib/data";

export default async function CookbookPage({ params }: { params: Promise<{ cookbookId: string }> }) {
  const { cookbookId } = await params;
  const [user, cookbook] = await Promise.all([getCurrentUser(), getCookbookById(cookbookId)]);

  return (
    <AppShell user={user}>
      <CookbookWorkspace cookbook={cookbook} />
    </AppShell>
  );
}
