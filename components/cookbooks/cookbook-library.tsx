import Link from "next/link";
import { Plus } from "lucide-react";

import { createCookbookAction } from "@/lib/actions";
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
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Cookbook shelf</p>
        <h2 className="text-4xl font-semibold tracking-tight">Pick a book off the shelf.</h2>
        <p className="max-w-2xl text-[15px] leading-8 text-[var(--muted-foreground)]">
          Open a cookbook to browse recipes inside it, search that collection, or add something new directly into the book.
        </p>
      </section>

      <section className="space-y-4">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {data.cookbooks.map((cookbook) => (
            <Link key={cookbook.id} href={`/cookbooks/${cookbook.id}`}>
              <article className="book-cover h-full min-h-[22rem] transition hover:-translate-y-1">
                <div className="book-spine" />
                <div className="book-face flex h-full flex-col justify-between">
                  <div className="space-y-4">
                    <p className="book-kicker">{cookbook.space.name}</p>
                    <h4 className="book-title">{cookbook.title}</h4>
                    <p className="text-sm leading-7 text-[rgba(255,251,245,0.8)]">
                      {cookbook.description ?? "A family collection ready to open like a real cookbook."}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="h-px bg-[rgba(255,251,245,0.18)]" />
                    <div className="flex flex-wrap gap-2">
                      <Badge className="border border-[rgba(255,251,245,0.18)] bg-transparent text-[rgba(255,251,245,0.9)]">
                        {cookbook.recipes.length} recipes
                      </Badge>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}

          <Card className="min-h-[22rem] border-dashed">
            <CardContent className="flex h-full flex-col justify-between p-6">
              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--muted)]/6">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-2xl font-semibold tracking-tight">New cookbook</h4>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                    Make a new book, choose which family space it belongs to, and start filling the shelf.
                  </p>
                </div>
              </div>
              <form action={createCookbookAction} className="space-y-3">
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Title</span>
                  <input
                    name="title"
                    required
                    placeholder="Sunday Suppers"
                    className="h-11 w-full rounded-xl border bg-white/80 px-4 text-sm"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Cookbook space</span>
                  <select name="spaceId" className="h-11 w-full rounded-xl border bg-white/80 px-4 text-sm" required>
                    <option value="">Choose a space</option>
                    {data.spaces.map(({ space }) => (
                      <option key={space.id} value={space.id}>
                        {space.name}
                      </option>
                    ))}
                  </select>
                </label>
                <Button className="w-full" type="submit">
                  Create book
                </Button>
              </form>
            </CardContent>
          </Card>
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
