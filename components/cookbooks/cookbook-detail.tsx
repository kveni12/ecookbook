import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CookbookDetail({
  cookbook
}: {
  cookbook: Awaited<ReturnType<typeof import("@/lib/data").getCookbookById>>;
}) {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="bg-[linear-gradient(135deg,rgba(217,180,143,0.52),rgba(108,139,99,0.24))] p-10">
          <Badge className="mb-4 bg-white/80">{cookbook.space.name}</Badge>
          <h1 className="text-5xl font-semibold">{cookbook.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--muted-foreground)]">
            {cookbook.description ?? "A themed family collection designed for warm browsing on screen and later PDF export."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Table of contents</CardTitle>
          <CardDescription>Web-first cookbook pages with room for photos, stories, and future printable export.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {cookbook.recipes.map((entry, index) => (
            <div key={entry.id} className="grid gap-4 rounded-[1.75rem] bg-white/70 p-5 lg:grid-cols-[80px_1fr]">
              <div className="text-3xl font-semibold text-[var(--muted-foreground)]">{String(index + 1).padStart(2, "0")}</div>
              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-semibold">{entry.recipe.title}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{entry.recipe.subtitle ?? entry.note ?? "Recipe keepsake page"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {entry.recipe.mainIngredients.map((ingredient) => (
                    <Badge key={ingredient}>{ingredient}</Badge>
                  ))}
                </div>
                {entry.recipe.story ? <p className="text-sm leading-6 text-[var(--muted-foreground)]">{entry.recipe.story}</p> : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
