import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type SearchData = Awaited<ReturnType<typeof import("@/lib/search").searchRecipes>>;

export function SearchResults({
  data,
  query,
  ingredients,
  filters
}: {
  data: SearchData;
  query: string;
  ingredients: string[];
  filters: {
    cuisine?: string;
    dietaryTag?: string;
    author?: string;
    spaceId?: string;
    sort: string;
  };
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search and discovery</CardTitle>
          <CardDescription>
            Search across titles, ingredients, notes, instructions, authors, and shared family spaces.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="space-y-2">
              <span className="text-sm font-medium">Search</span>
              <Input name="q" defaultValue={query} placeholder="chicken, dosa, picnic..." />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Ingredients</span>
              <Input name="ingredients" defaultValue={ingredients.join(", ")} placeholder="chicken, onion, garlic" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Cuisine</span>
              <Input name="cuisine" defaultValue={filters.cuisine} placeholder="South Indian" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Dietary tag</span>
              <Input name="dietaryTag" defaultValue={filters.dietaryTag} placeholder="vegetarian" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Author</span>
              <Input name="author" defaultValue={filters.author} placeholder="Maya" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Cookbook space</span>
              <select
                name="spaceId"
                defaultValue={filters.spaceId ?? ""}
                className="h-11 w-full rounded-2xl border bg-white/80 px-4 text-sm"
              >
                <option value="">All accessible spaces</option>
                {data.memberships.map(({ space }) => (
                  <option key={space.id} value={space.id}>
                    {space.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Sort</span>
              <select
                name="sort"
                defaultValue={filters.sort}
                className="h-11 w-full rounded-2xl border bg-white/80 px-4 text-sm"
              >
                <option value="newest">Newest</option>
                <option value="most-saved">Most saved</option>
                <option value="family-favorites">Family favorites</option>
                <option value="easiest">Easiest</option>
                <option value="most-remixed">Most remixed</option>
              </select>
            </label>
            <div className="flex items-end">
              <button className="h-11 rounded-full bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)]">
                Search recipes
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {query ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          You searched <span className="font-semibold text-[var(--foreground)]">{query}</span>
          {ingredients.length > 0 ? ` with ${ingredients.join(", ")}` : ""}.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {data.results.map(({ recipe, saveCount, remixCount }) => (
          <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
            <Card className="h-full transition hover:-translate-y-0.5">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold">{recipe.title}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {recipe.authorName ?? recipe.createdBy.name ?? recipe.createdBy.email}
                    </p>
                  </div>
                  {recipe.space ? <Badge>{recipe.space.name}</Badge> : <Badge>Private</Badge>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {recipe.mainIngredients.slice(0, 4).map((ingredient) => (
                    <Badge key={ingredient}>{ingredient}</Badge>
                  ))}
                </div>
                <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                  {recipe.subtitle ?? recipe.story ?? recipe.notes ?? "No summary yet."}
                </p>
                <div className="flex gap-3 text-sm text-[var(--muted-foreground)]">
                  <span>{saveCount} saves</span>
                  <span>{remixCount} remixes</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
