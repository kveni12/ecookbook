import Link from "next/link";
import { Flame, Heart, History, Sparkles, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMinutes } from "@/lib/utils";

export function DashboardOverview({ data }: { data: Awaited<ReturnType<typeof import("@/lib/data").getDashboardData>> }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-hidden">
          <CardContent className="relative p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,180,143,0.45),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(108,139,99,0.25),transparent_30%)]" />
            <div className="relative z-10 max-w-xl space-y-5">
              <Badge className="bg-[var(--accent)] text-[var(--accent-foreground)]">Living family cookbook</Badge>
              <h2 className="text-4xl font-semibold leading-tight">
                Preserve the flavor, the memory, and every thoughtful adaptation.
              </h2>
              <p className="text-[15px] leading-7 text-[var(--muted-foreground)]">
                Private spaces keep recipes close to the people they belong to while version history, comments, and
                personal notes make collaboration feel generous instead of chaotic.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="#new-recipe">Add a new recipe</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="#spaces">Browse spaces</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Favorite ingredients</CardTitle>
            <CardDescription>Signals from your recent family cooking activity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.favoriteIngredients.map(([ingredient, count]) => (
              <div key={ingredient} className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
                <span className="font-medium capitalize">{ingredient}</span>
                <Badge>{count} recipes</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Recent recipes", value: data.recentRecipes.length, icon: Flame },
          { label: "Adaptations", value: data.recentAdaptations.length, icon: Sparkles },
          { label: "Favorites", value: data.favorites.length, icon: Heart },
          { label: "Activity", value: data.activity.length, icon: History }
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-[var(--muted)] p-3">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{item.value}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section id="recipes" className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent recipes</CardTitle>
            <CardDescription>Shared dishes, private drafts, and keepsakes with media.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentRecipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="flex flex-col gap-3 rounded-[1.75rem] bg-white/70 p-4 transition hover:bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{recipe.title}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{recipe.subtitle ?? recipe.category ?? "Family recipe"}</p>
                  </div>
                  <Badge>{formatMinutes(recipe.totalTimeMinutes)}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recipe.mainIngredients.slice(0, 4).map((ingredient) => (
                    <Badge key={ingredient}>{ingredient}</Badge>
                  ))}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card id="spaces">
            <CardHeader>
              <CardTitle>Cookbook spaces</CardTitle>
              <CardDescription>Private groups for families, roommates, and close friends.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.spaces.map(({ space, role }) => (
                <Link
                  key={space.id}
                  href={`/spaces/${space.id}`}
                  className="flex items-center justify-between rounded-[1.5rem] bg-white/70 px-4 py-4"
                >
                  <div>
                    <p className="font-semibold">{space.name}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {space._count.recipes} recipes • {space._count.memberships} members
                    </p>
                  </div>
                  <Badge className="bg-[var(--muted)] text-[var(--foreground)]">{role.toLowerCase()}</Badge>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Family activity feed</CardTitle>
              <CardDescription>Recent recipe history and edits across your spaces.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.activity.map((entry) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="mt-1 rounded-full bg-[var(--secondary)] p-2">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{entry.changeSummary}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {entry.createdBy.name ?? entry.createdBy.email} on {entry.recipe.title}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
