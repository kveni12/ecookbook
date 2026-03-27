import "server-only";

import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/data";

type SearchParams = {
  q?: string;
  ingredients?: string[];
  cuisine?: string;
  dietaryTag?: string;
  author?: string;
  spaceId?: string;
  sort?: "newest" | "most-saved" | "family-favorites" | "easiest" | "most-remixed";
};

export async function searchRecipes(params: SearchParams) {
  const user = await getCurrentUser();
  const terms = params.q?.trim() ?? "";
  const ingredientTerms = (params.ingredients ?? []).filter(Boolean);

  const where: Prisma.RecipeWhereInput = {
    OR: [{ createdById: user.id }, { space: { memberships: { some: { userId: user.id } } } }],
    AND: [
      terms
        ? {
            OR: [
              { title: { contains: terms, mode: "insensitive" } },
              { subtitle: { contains: terms, mode: "insensitive" } },
              { story: { contains: terms, mode: "insensitive" } },
              { notes: { contains: terms, mode: "insensitive" } },
              { tips: { contains: terms, mode: "insensitive" } },
              { cuisine: { contains: terms, mode: "insensitive" } },
              { category: { contains: terms, mode: "insensitive" } },
              { authorName: { contains: terms, mode: "insensitive" } },
              { tags: { has: terms.toLowerCase() } },
              { mainIngredients: { has: terms.toLowerCase() } },
              {
                ingredients: {
                  some: {
                    item: { contains: terms, mode: "insensitive" }
                  }
                }
              },
              {
                steps: {
                  some: {
                    instruction: { contains: terms, mode: "insensitive" }
                  }
                }
              }
            ]
          }
        : {},
      ingredientTerms.length > 0
        ? {
            AND: ingredientTerms.map((ingredient) => ({
              OR: [
                { mainIngredients: { has: ingredient.toLowerCase() } },
                {
                  ingredients: {
                    some: {
                      item: { contains: ingredient, mode: "insensitive" }
                    }
                  }
                }
              ]
            }))
          }
        : {},
      params.cuisine ? { cuisine: { equals: params.cuisine, mode: "insensitive" } } : {},
      params.dietaryTag ? { dietaryTags: { has: params.dietaryTag.toLowerCase() } } : {},
      params.author ? { authorName: { contains: params.author, mode: "insensitive" } } : {},
      params.spaceId ? { spaceId: params.spaceId } : {}
    ]
  };

  const recipes = await db.recipe.findMany({
    where,
    include: {
      createdBy: true,
      space: true,
      favorites: true,
      adaptations: true
    },
    orderBy:
      params.sort === "easiest"
        ? [{ totalTimeMinutes: "asc" }, { updatedAt: "desc" }]
        : params.sort === "most-remixed"
          ? { adaptations: { _count: "desc" } }
          : { updatedAt: "desc" },
    take: 24
  });

  const ranked = recipes
    .map((recipe) => ({
      recipe,
      saveCount: recipe.favorites.length,
      remixCount: recipe.adaptations.length
    }))
    .sort((a, b) => {
      switch (params.sort) {
        case "most-saved":
        case "family-favorites":
          return b.saveCount - a.saveCount;
        case "most-remixed":
          return b.remixCount - a.remixCount;
        case "easiest":
          return (a.recipe.totalTimeMinutes ?? Number.MAX_SAFE_INTEGER) - (b.recipe.totalTimeMinutes ?? Number.MAX_SAFE_INTEGER);
        default:
          return b.recipe.updatedAt.getTime() - a.recipe.updatedAt.getTime();
      }
    });

  const memberships = await db.membership.findMany({
    where: { userId: user.id },
    include: { space: true },
    orderBy: { createdAt: "asc" }
  });

  return {
    user,
    memberships,
    results: ranked
  };
}
