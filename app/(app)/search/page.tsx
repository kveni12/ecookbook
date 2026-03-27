import { AppShell } from "@/components/layout/app-shell";
import { SearchResults } from "@/components/search/search-results";
import { searchRecipes } from "@/lib/search";

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{
    q?: string;
    ingredients?: string;
    cuisine?: string;
    dietaryTag?: string;
    author?: string;
    spaceId?: string;
    sort?: "newest" | "most-saved" | "family-favorites" | "easiest" | "most-remixed";
  }>;
}) {
  const params = await searchParams;
  const ingredients = (params.ingredients ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  const data = await searchRecipes({
    q: params.q,
    ingredients,
    cuisine: params.cuisine,
    dietaryTag: params.dietaryTag,
    author: params.author,
    spaceId: params.spaceId,
    sort: params.sort ?? "newest"
  });

  return (
    <AppShell user={data.user}>
      <SearchResults
        data={data}
        query={params.q ?? ""}
        ingredients={ingredients}
        filters={{
          cuisine: params.cuisine,
          dietaryTag: params.dietaryTag,
          author: params.author,
          spaceId: params.spaceId,
          sort: params.sort ?? "newest"
        }}
      />
    </AppShell>
  );
}
