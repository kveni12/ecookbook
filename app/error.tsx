"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>
              The app hit a server error. You can retry, or check your Vercel function logs for the digest below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error.digest ? (
              <p className="rounded-2xl bg-white/70 p-3 text-sm text-[var(--muted-foreground)]">
                Error digest: {error.digest}
              </p>
            ) : null}
            <Button onClick={reset}>Try again</Button>
          </CardContent>
        </Card>
      </body>
    </html>
  );
}
