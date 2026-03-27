import "server-only";

import { db } from "@/lib/db";

export async function getSimilarRecipesForUser(args: {
  recipeId: string;
  userId: string;
  ingredients: string[];
}) {
  const normalized = args.ingredients.map((ingredient) => ingredient.toLowerCase());

  const candidates = await db.recipe.findMany({
    where: {
      AND: [
        { id: { not: args.recipeId } },
        {
          OR: [{ createdById: args.userId }, { space: { memberships: { some: { userId: args.userId } } } }]
        }
      ]
    },
    include: {
      space: true,
      ingredients: true,
      favorites: true
    },
    take: 12
  });

  return candidates
    .map((recipe) => {
      const ingredientPool = [
        ...recipe.mainIngredients.map((ingredient) => ingredient.toLowerCase()),
        ...recipe.ingredients.map((ingredient) => ingredient.item.toLowerCase())
      ];
      const overlap = normalized.filter((ingredient) =>
        ingredientPool.some((candidate) => candidate.includes(ingredient))
      ).length;
      return {
        recipe,
        score: overlap + recipe.favorites.length * 0.15
      };
    })
    .filter(({ score }) => normalized.length === 0 || score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}
