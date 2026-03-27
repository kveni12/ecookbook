import { z } from "zod";

const ingredientLine = /^(?<quantity>\d+(?:\/\d+)?(?:\.\d+)?)?\s*(?<unit>cups?|tbsp|tsp|g|kg|ml|l|oz|lb|cloves?)?\s*(?<item>.+)$/i;

export const parseRecipeInputSchema = z.object({
  title: z.string().optional(),
  body: z.string().min(1),
  sourceUrl: z.string().url().optional()
});

export type ParsedRecipeDraft = {
  title: string;
  subtitle?: string;
  ingredients: Array<{
    quantity?: string;
    unit?: string;
    item: string;
    notes?: string;
  }>;
  steps: Array<{ instruction: string }>;
  mainIngredients: string[];
  tags: string[];
  sourcePreview?: {
    url?: string;
    extractionMode: "parsed-text" | "metadata-only";
  };
};

export function parseMessyRecipeText(input: string, sourceUrl?: string): ParsedRecipeDraft {
  const lines = input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const title = lines[0] ?? "Untitled recipe";
  const ingredientStart = lines.findIndex((line) => /ingredients?/i.test(line));
  const instructionStart = lines.findIndex((line) => /instructions?|method|directions?/i.test(line));

  const ingredientLines =
    ingredientStart >= 0
      ? lines.slice(ingredientStart + 1, instructionStart > ingredientStart ? instructionStart : undefined)
      : lines.filter((line) => /^[\d/]/.test(line));

  const stepLines =
    instructionStart >= 0
      ? lines.slice(instructionStart + 1)
      : lines.filter((line) => /^(step\s*\d+|\d+\.|-)/i.test(line));

  const ingredients = ingredientLines
    .map((line) => line.replace(/^[-*]\s*/, ""))
    .map((line) => {
      const match = ingredientLine.exec(line);
      if (!match?.groups) {
        return { item: line };
      }
      return {
        quantity: match.groups.quantity,
        unit: match.groups.unit,
        item: match.groups.item.trim()
      };
    })
    .filter((ingredient) => ingredient.item.length > 0);

  const steps = stepLines
    .map((line) => line.replace(/^(step\s*\d+|\d+\.|-)\s*/i, ""))
    .filter(Boolean)
    .map((instruction) => ({ instruction }));

  const ingredientTerms = ingredients.map((ingredient) => ingredient.item.toLowerCase());
  const mainIngredients = ingredientTerms
    .filter((term) => term.split(" ").length <= 3)
    .slice(0, 5);

  const tags = [
    sourceUrl ? "imported" : "manual",
    ingredientTerms.some((item) => item.includes("chicken")) ? "chicken" : undefined,
    ingredientTerms.some((item) => item.includes("rice")) ? "rice" : undefined
  ].filter(Boolean) as string[];

  return {
    title,
    ingredients,
    steps,
    mainIngredients,
    tags,
    sourcePreview: {
      url: sourceUrl,
      extractionMode: sourceUrl ? "metadata-only" : "parsed-text"
    }
  };
}
