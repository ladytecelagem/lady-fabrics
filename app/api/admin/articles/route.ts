import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const COLS = [
  "name", "slug", "subtitle", "description", "composition", "width", "weight",
  "abrasion", "finish", "care", "applications", "certifications",
  "hero_image_url", "gallery", "order", "collection_id",
  "seo_title", "seo_description", "og_image_url",
];

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { action, id, values } = await req.json();
    const sb = createServiceClient() as any;

    const { data: brand } = await sb.from("brands").select("id").eq("slug", "lady-fabrics").maybeSingle();
    if (!brand) return NextResponse.json({ error: "brand not found" }, { status: 500 });

    const patch: Record<string, any> = {};
    for (const k of COLS) if (values && k in values) patch[k] = values[k];

    if (action === "update" && id) {
      const { error } = await sb.from("fabric_articles").update(patch).eq("id", id).eq("brand_id", brand.id);
      if (error) throw error;
      return NextResponse.json({ ok: true, id });
    }

    if (action === "delete" && id) {
      const { error } = await sb.from("fabric_articles").delete().eq("id", id).eq("brand_id", brand.id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
