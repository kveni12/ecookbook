import { AppShell } from "@/components/layout/app-shell";
import { CookbookDetail } from "@/components/cookbooks/cookbook-detail";
import { getCookbookById, getCurrentUser } from "@/lib/data";

export default async function CookbookPage({ params }: { params: Promise<{ cookbookId: string }> }) {
  const { cookbookId } = await params;
  const [user, cookbook] = await Promise.all([getCurrentUser(), getCookbookById(cookbookId)]);

  return (
    <AppShell user={user}>
      <CookbookDetail cookbook={cookbook} />
    </AppShell>
  );
}
