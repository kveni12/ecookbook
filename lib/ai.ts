import { parseMessyRecipeText } from "@/lib/recipe-parser";

export function suggestRecipeMetadata(input: string) {
  const parsed = parseMessyRecipeText(input);
  const cuisine =
    parsed.ingredients.some((ingredient) => ingredient.item.toLowerCase().includes("garam masala")) ||
    parsed.ingredients.some((ingredient) => ingredient.item.toLowerCase().includes("curry leaves"))
      ? "Indian"
      : undefined;

  return {
    suggestedTags: parsed.tags,
    suggestedCuisine: cuisine,
    suggestedMainIngredients: parsed.mainIngredients
  };
}

export function summarizeCaptionToDraft(input: string) {
  const sentences = input
    .split(/[.!?]/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  return {
    summary: sentences.slice(0, 2).join(". "),
    parsed: parseMessyRecipeText(input)
  };
}
