import { AppShell } from "@/components/layout/app-shell";
import { RecipeDetail } from "@/components/recipes/recipe-detail";
import { getDashboardData, getRecipeById } from "@/lib/data";

export default async function RecipePage({ params }: { params: Promise<{ recipeId: string }> }) {
  const { recipeId } = await params;
  const [data, dashboard] = await Promise.all([getRecipeById(recipeId), getDashboardData()]);

  return (
    <AppShell user={data.user}>
      <RecipeDetail data={data} spaces={dashboard.spaces} />
    </AppShell>
  );
}
