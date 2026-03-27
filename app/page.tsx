import Link from "next/link";
import { ArrowRight, BookMarked, Sparkles, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-12 lg:px-6">
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Badge className="bg-[var(--accent)] text-[var(--accent-foreground)]">Private by default</Badge>
          <h1 className="max-w-3xl text-6xl font-semibold leading-tight tracking-tight">
            FamilyCookbook turns recipes into a living archive your people can actually grow together.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[var(--muted-foreground)]">
            Save recipes, preserve lineage, import messy sources, store voice notes, build themed cookbooks, and keep
            every dish inside private spaces with invited family and friends.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/sign-up">
                Start your cookbook
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>
        <Card className="overflow-hidden">
          <CardContent className="grid gap-4 p-6">
            {[
              {
                icon: Users,
                title: "Cookbook spaces",
                description: "Private groups with owners, editors, viewers, and email invites."
              },
              {
                icon: Sparkles,
                title: "Recipe lineage",
                description: "Fork, adapt, compare versions, and publish back with attribution."
              },
              {
                icon: BookMarked,
                title: "Digital keepsakes",
                description: "Rich recipe pages with photos, audio memories, stories, and themed collections."
              }
            ].map((feature) => (
              <div key={feature.title} className="rounded-[1.75rem] bg-white/70 p-5">
                <feature.icon className="mb-3 h-5 w-5" />
                <h2 className="text-xl font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{feature.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
