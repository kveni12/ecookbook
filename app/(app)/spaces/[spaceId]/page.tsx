import { AppShell } from "@/components/layout/app-shell";
import { SpaceDetail } from "@/components/spaces/space-detail";
import { getCurrentUser, getSpaceById } from "@/lib/data";

export default async function SpacePage({ params }: { params: Promise<{ spaceId: string }> }) {
  const { spaceId } = await params;
  const [user, membership] = await Promise.all([getCurrentUser(), getSpaceById(spaceId)]);

  return (
    <AppShell user={user}>
      <SpaceDetail membership={membership} />
    </AppShell>
  );
}
