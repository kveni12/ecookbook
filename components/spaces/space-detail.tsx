import { MembershipRole } from "@prisma/client";

import { inviteMemberAction } from "@/lib/actions";
import { getRoleLabel } from "@/lib/data";

import { CreateCookbookCard } from "@/components/cookbooks/create-cookbook-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function SpaceDetail({
  membership
}: {
  membership: Awaited<ReturnType<typeof import("@/lib/data").getSpaceById>>;
}) {
  const { space, role } = membership;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Badge className="w-fit">{getRoleLabel(role)}</Badge>
          <CardTitle className="text-4xl">{space.name}</CardTitle>
          <CardDescription>{space.description ?? "A private cookbook space for your people."}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] bg-white/70 p-4">
            <p className="text-sm text-[var(--muted-foreground)]">Recipes</p>
            <p className="mt-1 text-2xl font-semibold">{space.recipes.length}</p>
          </div>
          <div className="rounded-[1.5rem] bg-white/70 p-4">
            <p className="text-sm text-[var(--muted-foreground)]">Members</p>
            <p className="mt-1 text-2xl font-semibold">{space.memberships.length}</p>
          </div>
          <div className="rounded-[1.5rem] bg-white/70 p-4">
            <p className="text-sm text-[var(--muted-foreground)]">Cookbooks</p>
            <p className="mt-1 text-2xl font-semibold">{space.cookbooks.length}</p>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle>Shared recipes</CardTitle>
            <CardDescription>Recipes currently living in this family space.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {space.recipes.map((recipe) => (
              <a key={recipe.id} href={`/recipes/${recipe.id}`} className="block rounded-[1.5rem] bg-white/70 p-4">
                <p className="font-semibold">{recipe.title}</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  By {recipe.createdBy.name ?? recipe.createdBy.email} • {recipe.comments.length} comments • {recipe.favorites.length} saves
                </p>
              </a>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {space.memberships.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-[1.5rem] bg-white/70 px-4 py-3">
                  <div>
                    <p className="font-medium">{entry.user.name ?? entry.user.email}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{entry.user.email}</p>
                  </div>
                  <Badge>{getRoleLabel(entry.role)}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {role === MembershipRole.OWNER ? (
            <Card>
              <CardHeader>
                <CardTitle>Invite members</CardTitle>
                <CardDescription>Email-based invites keep access private and explicit.</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={inviteMemberAction} className="space-y-3">
                  <input type="hidden" name="spaceId" value={space.id} />
                  <Input name="email" placeholder="cousin@example.com" required />
                  <select name="role" className="h-11 w-full rounded-2xl border bg-white/80 px-4 text-sm">
                    <option value={MembershipRole.EDITOR}>Editor</option>
                    <option value={MembershipRole.VIEWER}>Viewer</option>
                  </select>
                  <Button type="submit">Send invite</Button>
                </form>
              </CardContent>
            </Card>
          ) : null}
          <CreateCookbookCard space={space} />
        </div>
      </section>
    </div>
  );
}
