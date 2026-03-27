"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

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

      <section id="add-recipe">
        <ImportStudio
          spaces={[{ space: { id: cookbook.space.id, name: cookbook.space.name } }]}
          defaultSpaceId={cookbook.spaceId}
          cookbookId={cookbook.id}
          title="Add a recipe to this cookbook"
          description="Write one from scratch, add an image, record a voice memo, upload a video, or save an Instagram/TikTok link directly into this book."
        />
      </section>

      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recipes in this cookbook</CardTitle>
            <CardDescription>Browse the book or search within it by title or ingredient.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-medium">Search this cookbook</span>
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a recipe or ingredient"
              />
            </label>

            <div className="space-y-4">
              {filteredRecipes.map((entry, index) => (
                <Link
                  key={entry.id}
                  href={`/recipes/${entry.recipe.id}`}
                  className="grid gap-4 rounded-xl border border-[var(--border)] bg-white/80 p-4 transition hover:bg-white md:grid-cols-[64px_1fr]"
                >
                  <div className="text-2xl font-semibold text-[rgba(47,36,28,0.38)]">
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
                <p className="rounded-xl border border-[var(--border)] bg-white/80 p-4 text-sm text-[var(--muted-foreground)]">
                  No recipes matched that search inside this cookbook.
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
