import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const BUCKET = "media";

const safeName = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const folder = (form.get("folder") as string) || "uploads";
    if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });
    if (file.size > 15 * 1024 * 1024) return NextResponse.json({ error: "max 15MB" }, { status: 400 });

    const sb = createServiceClient() as any;
    const path = `${safeName(folder)}/${Date.now()}-${safeName(file.name || "image")}`;
    const buf = Buffer.from(await file.arrayBuffer());

    const { error } = await sb.storage.from(BUCKET).upload(path, buf, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (error) throw error;

    const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ ok: true, url: data.publicUrl, path });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
