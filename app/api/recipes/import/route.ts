import { NextResponse } from "next/server";

import { parseMessyRecipeText, parseRecipeInputSchema } from "@/lib/recipe-parser";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = parseRecipeInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid recipe import payload." }, { status: 400 });
  }

  const draft = parseMessyRecipeText(parsed.data.body, parsed.data.sourceUrl);
  return NextResponse.json({ draft });
}
