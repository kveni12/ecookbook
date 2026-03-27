import { createCookbookAction } from "@/lib/actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreateCookbookCard({
  space
}: {
  space: Awaited<ReturnType<typeof import("@/lib/data").getSpaceById>>["space"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate a themed cookbook</CardTitle>
        <CardDescription>
          Select recipes, add a short intro, and create a web-first family cookbook ready for future PDF export.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createCookbookAction} className="space-y-4">
          <input type="hidden" name="spaceId" value={space.id} />
          <label className="block space-y-2">
            <span className="text-sm font-medium">Title</span>
            <Input name="title" placeholder="Grandma's Kitchen" required />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Description</span>
            <Input name="description" placeholder="Stories and staples for family gatherings." />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Intro</span>
            <Textarea name="intro" placeholder="A short opening note for the cookbook cover page." />
          </label>
          <div className="space-y-2">
            <p className="text-sm font-medium">Recipes</p>
            <div className="grid gap-2">
              {space.recipes.map((recipe) => (
                <label key={recipe.id} className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 text-sm">
                  <input type="checkbox" name="recipeIds" value={recipe.id} defaultChecked />
                  <span>{recipe.title}</span>
                </label>
              ))}
            </div>
          </div>
          <Button type="submit">Create cookbook</Button>
        </form>
      </CardContent>
    </Card>
  );
}
