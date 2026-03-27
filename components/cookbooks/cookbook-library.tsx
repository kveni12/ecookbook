import Link from "next/link";
import { Plus } from "lucide-react";

import { createCookbookAction } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CookbookLibrary({
  data
}: {
  data: Awaited<ReturnType<typeof import("@/lib/data").getDashboardData>>;
}) {
  const coverThemes = [
    "book-cover--berry",
    "book-cover--sage",
    "book-cover--cocoa",
    "book-cover--ink"
  ];

  return (
    <div className="space-y-8">
      <section className="space-y-5">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Cookbook shelf</p>
          <h2 className="text-4xl font-semibold tracking-tight">Choose a cookbook.</h2>
          <p className="max-w-2xl text-[15px] leading-8 text-[var(--muted-foreground)]">
            Everything starts here. Open a book to see its recipes, search inside it, and add something new without leaving the collection.
          </p>
        </div>
      </section>

      <section className="bookshelf-grid rounded-[2rem] border border-[rgba(40,35,29,0.08)] bg-[rgba(255,252,247,0.76)] p-5 md:p-7">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {data.cookbooks.map((cookbook, index) => (
            <Link key={cookbook.id} href={`/cookbooks/${cookbook.id}`} className="group">
              <article className={`book-cover ${coverThemes[index % coverThemes.length]} h-full min-h-[24rem] transition duration-200 group-hover:-translate-y-1`}>
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

          <Card id="new-book" className="min-h-[24rem] rounded-[1.6rem] border-[rgba(40,35,29,0.08)] bg-[rgba(255,255,252,0.88)]">
            <CardContent className="flex h-full flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="new-book-mark">
                  <Plus className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-semibold tracking-tight">New cookbook</h4>
                  <p className="text-sm leading-7 text-[var(--muted-foreground)]">
                    Add another book to the shelf and start collecting recipes inside it.
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
                    className="h-11 w-full rounded-2xl border bg-white/80 px-4 text-sm"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Cookbook space</span>
                  <select name="spaceId" className="h-11 w-full rounded-2xl border bg-white/80 px-4 text-sm" required>
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
                Make your first cookbook to start a shelf. Once a book exists, you can open it and add recipes directly inside it.
              </p>
              {data.spaces[0] ? (
                <Button asChild className="mt-5">
                  <Link href="#new-book">Create my first cookbook</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
