import Link from "next/link";
import { BookHeart, ChefHat, Home, LibraryBig, Search } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function AppShell({
  user,
  children
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
  children: React.ReactNode;
}) {
  const nav = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/search", label: "Search", icon: Search },
    { href: "/dashboard#recipes", label: "Recipes", icon: ChefHat },
    { href: "/dashboard#spaces", label: "Spaces", icon: BookHeart },
    { href: "/dashboard#cookbooks", label: "Cookbooks", icon: LibraryBig }
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 lg:px-6">
      <Card className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 flex-col justify-between p-5 lg:flex">
        <div className="space-y-8">
          <div className="space-y-2">
            <Badge className="bg-[var(--secondary)] text-[var(--secondary-foreground)]">Private family archive</Badge>
            <h1 className="text-3xl font-semibold">FamilyCookbook</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Recipes that carry memory, attribution, and all the little stories in between.
            </p>
          </div>
          <nav className="space-y-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-[var(--foreground)] transition hover:bg-white/65"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="rounded-[1.75rem] bg-[var(--muted)] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Search className="h-4 w-4" />
              Search and remix
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              Find recipes by ingredient overlap, family tags, and shared space history.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-[1.5rem] bg-white/60 p-3">
            <Avatar>
              <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
              <AvatarFallback>{(user.name ?? user.email ?? "F").slice(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name ?? "Family member"}</p>
              <p className="truncate text-xs text-[var(--muted-foreground)]">{user.email}</p>
            </div>
          </div>
          <Button asChild className="w-full">
            <Link href="/dashboard#new-recipe">Add recipe</Link>
          </Button>
        </div>
      </Card>
      <main className="min-w-0 flex-1 space-y-4">
        <Card className="p-4 lg:hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">FamilyCookbook</p>
              <p className="text-lg font-semibold">{user.name ?? "Family member"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-full bg-white/70 px-3 py-2 text-sm">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </Card>
        {children}
      </main>
    </div>
  );
}
