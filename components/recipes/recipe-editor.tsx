import { RecipeVisibility, SourceType } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveRecipeAction } from "@/lib/actions";

export function RecipeEditor({
  spaces
}: {
  spaces: Array<{ space: { id: string; name: string } }>;
}) {
  return (
    <Card id="new-recipe">
      <CardHeader>
        <CardTitle>Create a recipe</CardTitle>
        <CardDescription>Capture the recipe, the story, and the details your family will actually need later.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={saveRecipeAction} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Title</span>
            <Input name="title" placeholder="Grandma Leela's dosa" required />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Subtitle or story prompt</span>
            <Input name="subtitle" placeholder="The breakfast she made after every school recital" />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Story</span>
            <Textarea name="story" placeholder="Write the context, family memory, or oral history behind the recipe." />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Cookbook space</span>
            <select name="spaceId" className="h-11 w-full rounded-2xl border bg-white/80 px-4 text-sm">
              <option value="">Private only</option>
              {spaces.map(({ space }) => (
                <option key={space.id} value={space.id}>
                  {space.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Visibility</span>
            <select name="visibility" className="h-11 w-full rounded-2xl border bg-white/80 px-4 text-sm" defaultValue={RecipeVisibility.PRIVATE}>
              <option value={RecipeVisibility.PRIVATE}>Private to me</option>
              <option value={RecipeVisibility.SPACE}>Shared in space</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Cuisine</span>
            <Input name="cuisine" placeholder="South Indian" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Category</span>
            <Input name="category" placeholder="Breakfast" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Prep time (minutes)</span>
            <Input name="prepTimeMinutes" type="number" placeholder="20" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Cook time (minutes)</span>
            <Input name="cookTimeMinutes" type="number" placeholder="15" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Servings</span>
            <Input name="servings" type="number" placeholder="4" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Source type</span>
            <select name="sourceType" className="h-11 w-full rounded-2xl border bg-white/80 px-4 text-sm" defaultValue={SourceType.MANUAL}>
              {Object.values(SourceType).map((sourceType) => (
                <option key={sourceType} value={sourceType}>
                  {sourceType.replaceAll("_", " ").toLowerCase()}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Ingredients</span>
            <Textarea
              name="ingredients"
              placeholder={"2 cups rice flour\n1 cup urad dal | soaked overnight\n1 tsp salt"}
              required
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Instructions</span>
            <Textarea
              name="steps"
              placeholder={"Soak the dal overnight.\nBlend into a smooth batter.\nFerment and cook on a hot griddle."}
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Main ingredients</span>
            <Input name="mainIngredients" placeholder="rice flour, urad dal" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Dietary tags</span>
            <Input name="dietaryTags" placeholder="vegetarian, gluten-free" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Tags</span>
            <Input name="tags" placeholder="weekend, heirloom, grandma" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Cover image URL</span>
            <Input name="coverImage" placeholder="https://..." />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Notes and tips</span>
            <Textarea name="notes" placeholder="The batter should be airy. Add warm water on colder days." />
          </label>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit">Save recipe</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
