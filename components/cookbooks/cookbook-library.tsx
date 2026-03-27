import Link from "next/link";
import { BookOpenText, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CookbookLibrary({
  data
}: {
  data: Awaited<ReturnType<typeof import("@/lib/data").getDashboardData>>;
}) {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <Card>
          <CardContent className="p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Cookbook library</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">Open a cookbook and start cooking from there.</h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-8 text-[var(--muted-foreground)]">
              FamilyCookbook works best when each collection feels like a real book. Open one to browse recipes, search
              within it, or add a new recipe directly into that book.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your shelves</CardTitle>
            <CardDescription>Cookbooks you can open right now across your family spaces.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-xl border border-[var(--border)] bg-white/80 p-4">
              <p className="text-2xl font-semibold">{data.cookbooks.length}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Cookbooks</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-white/80 p-4">
              <p className="text-2xl font-semibold">{data.recentRecipes.length}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Recent recipes</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-white/80 p-4">
              <p className="text-2xl font-semibold">{data.spaces.length}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Spaces</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">My cookbooks</h3>
            <p className="text-sm text-[var(--muted-foreground)]">Choose a book to browse, search, and add recipes inside it.</p>
          </div>
          {data.cookbooks[0] ? (
            <Button asChild variant="outline">
              <Link href={`/spaces/${data.cookbooks[0].spaceId}`}>
                <Plus className="mr-2 h-4 w-4" />
                Create cookbook
              </Link>
            </Button>
          ) : null}
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.cookbooks.map((cookbook) => (
            <Link key={cookbook.id} href={`/cookbooks/${cookbook.id}`}>
              <article className="cookbook-sheet flex h-full flex-col justify-between px-7 py-8 transition hover:-translate-y-0.5">
                <div className="space-y-4">
                  <p className="cookbook-kicker">{cookbook.space.name}</p>
                  <h4 className="text-3xl font-semibold tracking-tight">{cookbook.title}</h4>
                  <p className="min-h-20 text-sm leading-7 text-[var(--muted-foreground)]">
                    {cookbook.description ?? "A family collection ready to open like a real cookbook."}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-[rgba(47,36,28,0.08)] pt-5">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="border border-[rgba(47,36,28,0.08)] bg-transparent text-[var(--foreground)]">
                      {cookbook.recipes.length} recipes
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <BookOpenText className="h-4 w-4" />
                    Open
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {data.cookbooks.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <h4 className="text-xl font-semibold">No cookbooks yet</h4>
              <p className="mt-2 max-w-xl text-sm leading-7 text-[var(--muted-foreground)]">
                Start by opening one of your cookbook spaces and generating a themed cookbook from the recipes inside it.
              </p>
              {data.spaces[0] ? (
                <Button asChild className="mt-5">
                  <Link href={`/spaces/${data.spaces[0].space.id}`}>Go to my space</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
