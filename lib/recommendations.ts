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
        },
        ...(normalized.length
          ? [
              {
                OR: [
                  { mainIngredients: { hasSome: normalized } },
                  {
                    ingredients: {
                      some: {
                        OR: normalized.map((ingredient) => ({
                          item: { contains: ingredient, mode: "insensitive" }
                        }))
                      }
                    }
                  }
                ]
              }
            ]
          : [])
      ]
    },
    include: {
      space: true,
      favorites: true
    },
    take: 12
  });

  return candidates
    .map((recipe) => {
      const overlap = recipe.mainIngredients.filter((ingredient) => normalized.includes(ingredient.toLowerCase())).length;
      return {
        recipe,
        score: overlap + recipe.favorites.length * 0.15
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}
