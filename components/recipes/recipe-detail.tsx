import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, RefreshCcw, Share2 } from "lucide-react";

import { addCommentAction, forkRecipeAction, publishAdaptationBackAction, savePersonalNoteAction, toggleFavoriteAction } from "@/lib/actions";
import { getVisibilityCopy } from "@/lib/data";
import { formatMinutes } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function RecipeDetail({
  data,
  spaces
}: {
  data: Awaited<ReturnType<typeof import("@/lib/data").getRecipeById>>;
  spaces: Array<{ space: { id: string; name: string } }>;
}) {
  const { recipe } = data;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-8">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge>{getVisibilityCopy(recipe.visibility)}</Badge>
              {recipe.cuisine ? <Badge>{recipe.cuisine}</Badge> : null}
              {recipe.category ? <Badge>{recipe.category}</Badge> : null}
            </div>
            <h1 className="text-4xl font-semibold">{recipe.title}</h1>
            <p className="mt-3 max-w-2xl text-lg text-[var(--muted-foreground)]">
              {recipe.subtitle ?? recipe.story ?? "A recipe preserved with story, attribution, and room to evolve."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <form action={forkRecipeAction.bind(null, recipe.id)}>
                <Button type="submit">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Fork recipe
                </Button>
              </form>
              <form
                action={async () => {
                  "use server";
                  await toggleFavoriteAction(recipe.id);
                }}
              >
                <Button variant="outline" type="submit">
                  <Heart className="mr-2 h-4 w-4" />
                  Favorite
                </Button>
              </form>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-4">
              {[
                { label: "Prep", value: formatMinutes(recipe.prepTimeMinutes) },
                { label: "Cook", value: formatMinutes(recipe.cookTimeMinutes) },
                { label: "Total", value: formatMinutes(recipe.totalTimeMinutes) },
                { label: "Serves", value: recipe.servings ?? "Family style" }
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-[var(--border)] bg-white/80 p-4">
                  <p className="text-sm text-[var(--muted-foreground)]">{item.label}</p>
                  <p className="mt-1 font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-72">
            {recipe.coverImage ? (
              <Image src={recipe.coverImage} alt={recipe.title} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-[var(--muted)] p-8 text-center text-[var(--muted-foreground)]">
                Add a cover image, handwritten card photo, or family table snapshot.
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recipe.ingredients.map((ingredient) => (
                <div key={ingredient.id} className="flex items-start justify-between gap-4 rounded-xl border border-[var(--border)] bg-white/80 px-4 py-3">
                  <div>
                    <p className="font-medium">{[ingredient.quantity, ingredient.unit, ingredient.item].filter(Boolean).join(" ")}</p>
                    {ingredient.notes ? <p className="text-sm text-[var(--muted-foreground)]">{ingredient.notes}</p> : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recipe.steps.map((step, index) => (
                <div key={step.id} className="flex gap-4 rounded-xl border border-[var(--border)] bg-white/80 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--muted)] text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p>{step.instruction}</p>
                    {step.note ? <p className="mt-2 text-sm text-[var(--muted-foreground)]">{step.note}</p> : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
              <CardDescription>Questions, memories, substitutions, and family context.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={addCommentAction} className="space-y-3">
                <input type="hidden" name="recipeId" value={recipe.id} />
                <Textarea name="body" placeholder="Add a comment, memory, or suggestion." required />
                <Button type="submit">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Post comment
                </Button>
              </form>
              {recipe.comments.map((comment) => (
                <div key={comment.id} className="rounded-xl border border-[var(--border)] bg-white/80 p-4">
                  <p className="text-sm font-medium">{comment.user.name ?? comment.user.email}</p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">{comment.body}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recipe lineage</CardTitle>
              <CardDescription>Preserve attribution while letting recipes evolve naturally.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recipe.parentRecipe ? (
                <Link href={`/recipes/${recipe.parentRecipe.id}`} className="block rounded-xl border border-[var(--border)] bg-white/80 p-4">
                  <p className="text-sm text-[var(--muted-foreground)]">Adapted from</p>
                  <p className="font-semibold">{recipe.parentRecipe.title}</p>
                </Link>
              ) : (
                <p className="rounded-xl border border-[var(--border)] bg-white/80 p-4 text-sm text-[var(--muted-foreground)]">
                  This recipe is the original source in its current family branch.
                </p>
              )}
              {recipe.lineageNote ? <p className="text-sm text-[var(--muted-foreground)]">{recipe.lineageNote}</p> : null}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/55 p-4">
                <p className="text-sm font-medium">Side-by-side comparison</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  This scaffold stores version snapshots for original and adapted recipes so a diff view can be layered
                  on top without changing the data model.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personal notes</CardTitle>
              <CardDescription>Your notes stay private, even when the recipe is shared.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={savePersonalNoteAction} className="space-y-3">
                <input type="hidden" name="recipeId" value={recipe.id} />
                <Textarea name="body" defaultValue={recipe.personalNotes[0]?.body} placeholder="My own tweaks, timing notes, or serving ideas." />
                <Button type="submit">Save personal note</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Share adaptation back</CardTitle>
              <CardDescription>Publish your fork into a family space with attribution.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={publishAdaptationBackAction} className="space-y-3">
                <input type="hidden" name="recipeId" value={recipe.id} />
                <select name="targetSpaceId" className="h-11 w-full rounded-2xl border bg-white/80 px-4 text-sm">
                  {spaces.map(({ space }) => (
                    <option key={space.id} value={space.id}>
                      {space.name}
                    </option>
                  ))}
                </select>
                <Button type="submit">
                  <Share2 className="mr-2 h-4 w-4" />
                  Publish to family space
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Version history</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recipe.versions.map((version) => (
                <div key={version.id} className="rounded-xl border border-[var(--border)] bg-white/80 p-4">
                  <p className="font-medium">{version.changeSummary}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{version.createdBy.name ?? version.createdBy.email}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Similar recipes</CardTitle>
              <CardDescription>Related by ingredient overlap now, ready for embeddings later.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.similarRecipes.length > 0 ? (
                data.similarRecipes.map(({ recipe: similar }) => (
                  <Link key={similar.id} href={`/recipes/${similar.id}`} className="block rounded-xl border border-[var(--border)] bg-white/80 p-4">
                    <p className="font-semibold">{similar.title}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {similar.mainIngredients.slice(0, 3).join(", ")}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="rounded-xl border border-[var(--border)] bg-white/80 p-4 text-sm text-[var(--muted-foreground)]">
                  Similar recipes will appear here as your family archive grows.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
