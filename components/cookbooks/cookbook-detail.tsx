import { Badge } from "@/components/ui/badge";

export function CookbookDetail({
  cookbook
}: {
  cookbook: Awaited<ReturnType<typeof import("@/lib/data").getCookbookById>>;
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <section className="cookbook-sheet overflow-hidden px-8 py-12 md:px-14 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="cookbook-kicker">Family cookbook</p>
          <h1 className="cookbook-title mt-6">{cookbook.title}</h1>
          <p className="mt-6 text-base leading-8 text-[var(--muted-foreground)] md:text-lg">
            {cookbook.description ?? "A themed family collection designed for slow browsing, keepsake sharing, and future print export."}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Badge className="border border-[rgba(47,36,28,0.08)] bg-transparent text-[var(--foreground)]">
              {cookbook.space.name}
            </Badge>
            <Badge className="border border-[rgba(47,36,28,0.08)] bg-transparent text-[var(--foreground)]">
              {cookbook.recipes.length} recipes
            </Badge>
          </div>
          {cookbook.intro ? (
            <p className="mx-auto mt-10 max-w-2xl border-t border-[rgba(47,36,28,0.08)] pt-8 text-left text-[15px] leading-8 text-[var(--muted-foreground)]">
              {cookbook.intro}
            </p>
          ) : null}
        </div>
      </section>

      <section className="cookbook-sheet px-8 py-10 md:px-14 md:py-12">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="cookbook-kicker">Contents</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">Table of contents</h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--muted-foreground)]">
              A quieter, more book-like reading view with room for stories, notes, and a future printable edition.
            </p>
          </div>
          <div className="space-y-5">
            {cookbook.recipes.map((entry, index) => (
              <article
                key={entry.id}
                className="grid gap-4 border-b border-[rgba(47,36,28,0.08)] pb-5 last:border-b-0 last:pb-0 md:grid-cols-[72px_1fr]"
              >
                <div className="text-2xl font-semibold text-[rgba(47,36,28,0.42)]">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-semibold tracking-tight">{entry.recipe.title}</h3>
                    <p className="text-sm italic text-[var(--muted-foreground)]">
                      {entry.recipe.subtitle ?? entry.note ?? "Recipe page"}
                    </p>
                  </div>
                  {entry.recipe.story ? (
                    <p className="max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">{entry.recipe.story}</p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {entry.recipe.mainIngredients.map((ingredient) => (
                      <Badge
                        key={ingredient}
                        className="border border-[rgba(47,36,28,0.08)] bg-transparent text-[var(--muted-foreground)]"
                      >
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        {cookbook.recipes.map((entry, index) => (
          <article key={entry.id} className="cookbook-sheet flex h-full flex-col px-8 py-10 md:px-12">
            <p className="cookbook-kicker">Recipe {String(index + 1).padStart(2, "0")}</p>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight">{entry.recipe.title}</h3>
            {entry.recipe.subtitle ? (
              <p className="mt-3 text-base italic leading-7 text-[var(--muted-foreground)]">{entry.recipe.subtitle}</p>
            ) : null}
            {entry.recipe.story ? (
              <p className="mt-6 border-t border-[rgba(47,36,28,0.08)] pt-6 text-sm leading-8 text-[var(--muted-foreground)]">
                {entry.recipe.story}
              </p>
            ) : null}
            <div className="mt-8 grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(47,36,28,0.52)]">
                  Ingredients
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-7">
                  {entry.recipe.ingredients.map((ingredient) => (
                    <li key={ingredient.id} className="border-b border-[rgba(47,36,28,0.06)] pb-3 last:border-b-0">
                      {[ingredient.quantity, ingredient.unit, ingredient.item].filter(Boolean).join(" ")}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(47,36,28,0.52)]">
                  Method
                </p>
                <ol className="mt-4 space-y-4">
                  {entry.recipe.steps.map((step, stepIndex) => (
                    <li key={step.id} className="grid grid-cols-[28px_1fr] gap-3 text-sm leading-7">
                      <span className="text-[rgba(47,36,28,0.45)]">{stepIndex + 1}.</span>
                      <span>{step.instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
