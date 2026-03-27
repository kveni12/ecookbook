import Link from "next/link";
import type { ReactNode } from "react";
import { Home, Search } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function AppShell({
  user,
  children
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
  children: ReactNode;
}) {
  const nav = [
    { href: "/dashboard", label: "Cookbooks", icon: Home },
    { href: "/search", label: "Search", icon: Search }
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 lg:px-6">
      <Card className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 flex-col justify-between border-[rgba(40,35,29,0.08)] bg-[rgba(255,253,249,0.92)] p-6 lg:flex">
        <div className="space-y-10">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">FamilyCookbook</p>
            <h1 className="text-2xl font-semibold tracking-tight">Your shelf</h1>
            <p className="text-sm leading-7 text-[var(--muted-foreground)]">
              Pick a book, open it, and keep your family recipes together in one place.
            </p>
          </div>
          <nav className="space-y-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--foreground)] transition hover:bg-[var(--muted)]"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="rounded-2xl border border-[rgba(40,35,29,0.08)] bg-[rgba(244,239,231,0.75)] p-4">
            <div className="mb-3 text-sm font-medium">How it works</div>
            <p className="text-sm leading-7 text-[var(--muted-foreground)]">
              Start on the shelf, open a cookbook, then add recipes from notes, photos, videos, or voice memos right inside it.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[rgba(40,35,29,0.08)] bg-white/88 p-3">
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
            <Link href="/dashboard">Open shelf</Link>
          </Button>
        </div>
      </Card>
      <main className="min-w-0 flex-1 space-y-4">
        <Card className="border-[rgba(40,35,29,0.08)] bg-[rgba(255,253,249,0.92)] p-4 lg:hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">FamilyCookbook</p>
              <p className="text-lg font-semibold">{user.name ?? "Family member"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-[rgba(40,35,29,0.08)] bg-white/88 px-3 py-2 text-sm"
                >
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
