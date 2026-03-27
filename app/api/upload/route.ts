import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/storage";

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase Storage is not configured. Add the storage environment variables first." },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
  }

  const path = `${randomUUID()}-${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(process.env.SUPABASE_STORAGE_BUCKET ?? "familycookbook")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage
    .from(process.env.SUPABASE_STORAGE_BUCKET ?? "familycookbook")
    .getPublicUrl(path);

  return NextResponse.json({ url: data.publicUrl, path });
}
