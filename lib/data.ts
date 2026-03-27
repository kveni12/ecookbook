import "server-only";

import { MembershipRole, RecipeVisibility } from "@prisma/client";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { canViewRecipe } from "@/lib/permissions";
import { getSimilarRecipesForUser } from "@/lib/recommendations";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) redirect("/sign-in");
  return user;
}

export async function getDashboardData() {
  const user = await getCurrentUser();

  const [spaces, recentRecipes, recentAdaptations, favorites, activity, cookbooks] = await Promise.all([
    db.membership.findMany({
      where: { userId: user.id },
      include: {
        space: {
          include: {
            _count: { select: { recipes: true, memberships: true } }
          }
        }
      },
      orderBy: { createdAt: "asc" }
    }),
    db.recipe.findMany({
      where: {
        OR: [{ createdById: user.id }, { space: { memberships: { some: { userId: user.id } } } }]
      },
      include: {
        space: true,
        favorites: true,
        comments: true
      },
      orderBy: { updatedAt: "desc" },
      take: 6
    }),
    db.recipe.findMany({
      where: {
        parentRecipeId: { not: null },
        OR: [{ createdById: user.id }, { space: { memberships: { some: { userId: user.id } } } }]
      },
      include: { parentRecipe: true, space: true },
      orderBy: { updatedAt: "desc" },
      take: 4
    }),
    db.recipeFavorite.findMany({
      where: { userId: user.id },
      include: { recipe: true },
      take: 5
    }),
    db.recipeVersion.findMany({
      where: {
        recipe: {
          OR: [{ createdById: user.id }, { space: { memberships: { some: { userId: user.id } } } }]
        }
      },
      include: { recipe: true, createdBy: true },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    db.cookbook.findMany({
      where: { space: { memberships: { some: { userId: user.id } } } },
      include: { space: true, recipes: true },
      take: 4
    })
  ]);

  const favoriteIngredients = recentRecipes
    .flatMap((recipe) => recipe.mainIngredients)
    .reduce<Record<string, number>>((acc, item) => {
      acc[item] = (acc[item] ?? 0) + 1;
      return acc;
    }, {});

  return {
    user,
    spaces,
    recentRecipes,
    recentAdaptations,
    favorites,
    activity,
    cookbooks,
    favoriteIngredients: Object.entries(favoriteIngredients)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  };
}

export async function getSpaceById(spaceId: string) {
  const user = await getCurrentUser();

  const membership = await db.membership.findUnique({
    where: {
      userId_spaceId: {
        userId: user.id,
        spaceId
      }
    },
    include: {
      space: {
        include: {
          memberships: { include: { user: true } },
          recipes: {
            include: {
              favorites: true,
              comments: true,
              createdBy: true
            },
            orderBy: { updatedAt: "desc" }
          },
          cookbooks: true,
          invites: {
            where: { status: "PENDING" },
            orderBy: { createdAt: "desc" }
          }
        }
      }
    }
  });

  if (!membership) redirect("/dashboard");
  return membership;
}

export async function getRecipeById(recipeId: string) {
  const user = await getCurrentUser();
  const recipe = await db.recipe.findUnique({
    where: { id: recipeId },
    include: {
      space: true,
      ingredients: { orderBy: { position: "asc" } },
      steps: { orderBy: { position: "asc" } },
      media: { orderBy: { position: "asc" } },
      versions: { include: { createdBy: true }, orderBy: { createdAt: "desc" } },
      comments: { include: { user: true }, orderBy: { createdAt: "desc" } },
      favorites: true,
      parentRecipe: true,
      adaptations: true,
      createdBy: true,
      lastEditedBy: true,
      personalNotes: {
        where: { userId: user.id }
      }
    }
  });

  if (!recipe) redirect("/dashboard");

  const membership = recipe.spaceId
    ? await db.membership.findUnique({
        where: {
          userId_spaceId: {
            userId: user.id,
            spaceId: recipe.spaceId
          }
        }
      })
    : null;

  const canView = canViewRecipe({
    createdById: recipe.createdById,
    currentUserId: user.id,
    visibility: recipe.visibility,
    isSpaceMember: Boolean(membership)
  });

  if (!canView) redirect("/dashboard");

  const similarRecipes = await getSimilarRecipesForUser({
    recipeId: recipe.id,
    userId: user.id,
    ingredients: recipe.mainIngredients
  });

  return {
    user,
    membershipRole: membership?.role ?? null,
    recipe,
    similarRecipes
  };
}

export async function getCookbookById(cookbookId: string) {
  const user = await getCurrentUser();
  const cookbook = await db.cookbook.findFirst({
    where: {
      id: cookbookId,
      space: { memberships: { some: { userId: user.id } } }
    },
    include: {
      space: true,
      recipes: {
        include: {
          recipe: {
            include: {
              ingredients: true,
              steps: true,
              media: true
            }
          }
        },
        orderBy: { position: "asc" }
      }
    }
  });

  if (!cookbook) redirect("/dashboard");
  return cookbook;
}

export function getRoleLabel(role: MembershipRole) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

export function getVisibilityCopy(visibility: RecipeVisibility) {
  return visibility === RecipeVisibility.PRIVATE ? "Private to me" : "Shared in space";
}
