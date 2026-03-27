import type { Recipe, RecipeIngredient, RecipeMedia, RecipeStep } from "@prisma/client";

export type RecipeSnapshot = {
  recipe: Pick<
    Recipe,
    | "title"
    | "subtitle"
    | "story"
    | "prepTimeMinutes"
    | "cookTimeMinutes"
    | "totalTimeMinutes"
    | "servings"
    | "cuisine"
    | "category"
    | "tags"
    | "mainIngredients"
    | "dietaryTags"
    | "coverImage"
    | "sourceLink"
    | "sourceType"
    | "authorName"
    | "visibility"
    | "notes"
    | "tips"
    | "lineageNote"
  >;
  ingredients: Array<Pick<RecipeIngredient, "position" | "quantity" | "unit" | "item" | "notes">>;
  steps: Array<Pick<RecipeStep, "position" | "instruction" | "note">>;
  media: Array<Pick<RecipeMedia, "type" | "url" | "thumbnailUrl" | "caption" | "position">>;
};

export function buildRecipeSnapshot(input: {
  recipe: Recipe;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  media: RecipeMedia[];
}): RecipeSnapshot {
  return {
    recipe: {
      title: input.recipe.title,
      subtitle: input.recipe.subtitle,
      story: input.recipe.story,
      prepTimeMinutes: input.recipe.prepTimeMinutes,
      cookTimeMinutes: input.recipe.cookTimeMinutes,
      totalTimeMinutes: input.recipe.totalTimeMinutes,
      servings: input.recipe.servings,
      cuisine: input.recipe.cuisine,
      category: input.recipe.category,
      tags: input.recipe.tags,
      mainIngredients: input.recipe.mainIngredients,
      dietaryTags: input.recipe.dietaryTags,
      coverImage: input.recipe.coverImage,
      sourceLink: input.recipe.sourceLink,
      sourceType: input.recipe.sourceType,
      authorName: input.recipe.authorName,
      visibility: input.recipe.visibility,
      notes: input.recipe.notes,
      tips: input.recipe.tips,
      lineageNote: input.recipe.lineageNote
    },
    ingredients: input.ingredients.map(({ position, quantity, unit, item, notes }) => ({
      position,
      quantity,
      unit,
      item,
      notes
    })),
    steps: input.steps.map(({ position, instruction, note }) => ({
      position,
      instruction,
      note
    })),
    media: input.media.map(({ type, url, thumbnailUrl, caption, position }) => ({
      type,
      url,
      thumbnailUrl,
      caption,
      position
    }))
  };
}

export function summarizeRecipeChanges(previous: RecipeSnapshot, next: RecipeSnapshot) {
  const changes: string[] = [];
  if (previous.recipe.title !== next.recipe.title) changes.push("Updated the recipe title");
  if (previous.recipe.story !== next.recipe.story) changes.push("Refined the family story");
  if (JSON.stringify(previous.ingredients) !== JSON.stringify(next.ingredients)) changes.push("Adjusted ingredients");
  if (JSON.stringify(previous.steps) !== JSON.stringify(next.steps)) changes.push("Edited instructions");
  if (JSON.stringify(previous.media) !== JSON.stringify(next.media)) changes.push("Updated media");
  return changes.length > 0 ? changes.join(", ") : "Saved recipe details";
}
