import { describe, expect, it } from "vitest";

import { parseMessyRecipeText } from "@/lib/recipe-parser";

describe("parseMessyRecipeText", () => {
  it("extracts ingredients and steps from a rough text blob", () => {
    const parsed = parseMessyRecipeText(`Lemon Rice
Ingredients
3 cups cooked rice
2 lemons
1/2 cup peanuts
Instructions
1. Warm the rice.
2. Toss with lemon and peanuts.`);

    expect(parsed.title).toBe("Lemon Rice");
    expect(parsed.ingredients).toHaveLength(3);
    expect(parsed.steps).toHaveLength(2);
    expect(parsed.mainIngredients).toContain("cooked rice");
  });
});
