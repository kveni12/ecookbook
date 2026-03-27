"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { formatMinutes } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImportStudio } from "@/components/recipes/import-studio";

export function CookbookWorkspace({
  cookbook
}: {
  cookbook: Awaited<ReturnType<typeof import("@/lib/data").getCookbookById>>;
}) {
  const [query, setQuery] = useState("");

  const filteredRecipes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return cookbook.recipes;
    }

    return cookbook.recipes.filter((entry) => {
      const recipe = entry.recipe;
      return (
        recipe.title.toLowerCase().includes(normalized) ||
        recipe.subtitle?.toLowerCase().includes(normalized) ||
        recipe.mainIngredients.some((ingredient) => ingredient.toLowerCase().includes(normalized)) ||
        recipe.ingredients.some((ingredient) => ingredient.item.toLowerCase().includes(normalized))
      );
    });
  }, [cookbook.recipes, query]);

  return (
    <div className="space-y-8">
      <section className="cookbook-sheet px-8 py-10 md:px-14 md:py-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="cookbook-kicker">{cookbook.space.name}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">{cookbook.title}</h1>
            <p className="mt-4 text-[15px] leading-8 text-[var(--muted-foreground)]">
              {cookbook.description ?? "Open the book, browse the recipes, and add new ones directly into this collection."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge className="border border-[rgba(47,36,28,0.08)] bg-transparent text-[var(--foreground)]">
              {cookbook.recipes.length} recipes
            </Badge>
            <Button asChild>
              <Link href="#add-recipe">
                <Plus className="mr-2 h-4 w-4" />
                Add recipe
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">All cookbooks</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <Card className="border-[rgba(40,35,29,0.08)] bg-[rgba(255,253,249,0.92)]">
          <CardHeader className="space-y-4">
            <div className="space-y-2">
              <CardTitle>Recipes in this cookbook</CardTitle>
              <CardDescription>Browse the collection like a table of contents, then open any recipe page.</CardDescription>
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Search this cookbook</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search a recipe or ingredient"
                  className="pl-10"
                />
              </div>
            </label>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {filteredRecipes.map((entry, index) => (
                <Link
                  key={entry.id}
                  href={`/recipes/${entry.recipe.id}`}
                  className="grid gap-4 rounded-[1.35rem] border border-[rgba(40,35,29,0.08)] bg-white/88 p-5 transition hover:bg-white md:grid-cols-[64px_1fr]"
                >
                  <div className="text-2xl font-semibold text-[rgba(47,36,28,0.34)]">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xl font-semibold">{entry.recipe.title}</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {entry.recipe.subtitle ?? entry.note ?? "Cookbook recipe"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {entry.recipe.mainIngredients.slice(0, 4).map((ingredient) => (
                        <Badge key={ingredient}>{ingredient}</Badge>
                      ))}
                    </div>
                    <div className="text-sm text-[var(--muted-foreground)]">
                      {formatMinutes(entry.recipe.totalTimeMinutes)} • {entry.recipe.servings ?? "Family style"}
                    </div>
                  </div>
                </Link>
              ))}

              {filteredRecipes.length === 0 ? (
                <p className="rounded-[1.35rem] border border-[rgba(40,35,29,0.08)] bg-white/88 p-5 text-sm text-[var(--muted-foreground)]">
                  No recipes matched that search inside this cookbook.
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <section id="add-recipe">
          <ImportStudio
            spaces={[{ space: { id: cookbook.space.id, name: cookbook.space.name } }]}
            defaultSpaceId={cookbook.spaceId}
            cookbookId={cookbook.id}
            title="Add a recipe"
            description="Keep everything in this book. Add a recipe by typing it in, uploading a recipe card, recording a voice memo, adding a video, or saving an Instagram or TikTok link."
          />
        </section>
      </section>
    </div>
  );
}
