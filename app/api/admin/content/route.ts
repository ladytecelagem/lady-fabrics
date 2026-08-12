import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Tabelas permitidas + colunas editaveis (whitelist — nunca confiar no client).
const ALLOWED: Record<string, string[]> = {
  pages: ["eyebrow", "title", "subtitle", "body", "hero_image_url", "hero_video_url", "sections", "seo_title", "seo_description", "og_image_url"],
  news: ["title", "slug", "category", "excerpt", "body", "cover_image_url", "author_name", "published_at", "seo_title", "seo_description", "og_image_url"],
  industries: ["name", "slug", "order", "description", "story", "image_url", "gallery", "seo_title", "seo_description", "og_image_url"],
  collections: ["name", "slug", "subtitle", "tagline", "story", "fiber", "applications", "hero_image_url", "gallery", "order", "seo_title", "seo_description", "og_image_url"],
};

function pick(table: string, input: Record<string, any>) {
  const cols = ALLOWED[table];
  const out: Record<string, any> = {};
  for (const k of cols) if (k in input) out[k] = input[k];
  return out;
}

async function brandId(sb: any): Promise<string | null> {
  const { data } = await sb.from("brands").select("id").eq("slug", "lady-fabrics").single();
  return data?.id ?? null;
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { action, table, id, key, values } = await req.json();
    if (!ALLOWED[table]) return NextResponse.json({ error: "table not allowed" }, { status: 400 });

    const sb = createServiceClient();
    const bid = await brandId(sb);
    if (!bid) return NextResponse.json({ error: "brand not found" }, { status: 500 });

    const patch = pick(table, values || {});

    // UPDATE por id
    if (action === "update" && id) {
      const { error } = await sb.from(table).update(patch).eq("id", id).eq("brand_id", bid);
      if (error) throw error;
      return NextResponse.json({ ok: true, id });
    }

    // UPSERT de page por key (pages usa key único por marca)
    if (action === "upsert-page" && key) {
      const { data: existing } = await sb.from("pages").select("id").eq("brand_id", bid).eq("key", key).maybeSingle();
      if (existing) {
        const { error } = await sb.from("pages").update(patch).eq("id", existing.id);
        if (error) throw error;
        return NextResponse.json({ ok: true, id: existing.id });
      }
      const { data, error } = await sb.from("pages").insert({ ...patch, key, brand_id: bid }).select("id").single();
      if (error) throw error;
      return NextResponse.json({ ok: true, id: data.id });
    }

    // CREATE (news / industries / collections)
    if (action === "create") {
      const { data, error } = await sb.from(table).insert({ ...patch, brand_id: bid }).select("id").single();
      if (error) throw error;
      return NextResponse.json({ ok: true, id: data.id });
    }

    // DELETE
    if (action === "delete" && id) {
      const { error } = await sb.from(table).delete().eq("id", id).eq("brand_id", bid);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
