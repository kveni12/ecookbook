import { describe, expect, it } from "vitest";

import { summarizeRecipeChanges, type RecipeSnapshot } from "@/lib/recipe-versioning";

describe("recipe versioning", () => {
  it("describes ingredient edits in the changelog summary", () => {
    const previous: RecipeSnapshot = {
      recipe: {
        title: "Dosa",
        subtitle: null,
        story: null,
        prepTimeMinutes: null,
        cookTimeMinutes: null,
        totalTimeMinutes: null,
        servings: null,
        cuisine: null,
        category: null,
        tags: [],
        mainIngredients: [],
        dietaryTags: [],
        coverImage: null,
        sourceLink: null,
        sourceType: "MANUAL",
        authorName: null,
        visibility: "PRIVATE",
        notes: null,
        tips: null,
        lineageNote: null
      },
      ingredients: [{ position: 0, item: "1 cup rice", notes: null, quantity: null, unit: null }],
      steps: [{ position: 0, instruction: "Mix.", note: null }],
      media: []
    };

    const next: RecipeSnapshot = {
      ...previous,
      ingredients: [{ position: 0, item: "2 cups rice", notes: null, quantity: null, unit: null }]
    };

    expect(summarizeRecipeChanges(previous, next)).toContain("Adjusted ingredients");
  });
});
