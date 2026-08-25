import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const copySlug = (srcId: string) => `lt-${srcId}`.slice(0, 96);

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 96);

// garante 1 article por nome de tecido dentro da marca
async function ensureArticle(sb: any, brandId: string, collectionId: string, name: string) {
  const slug = slugify(name || "fabric");
  const { data: found } = await sb.from("fabric_articles")
    .select("id,collection_id").eq("brand_id", brandId).eq("slug", slug).maybeSingle();
  if (found) {
    if (!found.collection_id) await sb.from("fabric_articles").update({ collection_id: collectionId }).eq("id", found.id);
    return found.id;
  }
  const { data, error } = await sb.from("fabric_articles")
    .insert({ brand_id: brandId, collection_id: collectionId, name, slug })
    .select("id").single();
  if (error) throw error;
  return data.id;
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { sourceId, collectionId, assign } = await req.json();
    if (!sourceId || !collectionId) {
      return NextResponse.json({ error: "sourceId and collectionId required" }, { status: 400 });
    }

    const sb = createServiceClient() as any;

    const { data: brand } = await sb.from("brands").select("id").eq("slug", "lady-fabrics").maybeSingle();
    if (!brand) return NextResponse.json({ error: "brand 'lady-fabrics' not found" }, { status: 500 });
    const dst = brand.id;
    const slug = copySlug(sourceId);

    const { data: existing } = await sb.from("fabrics")
      .select("id,in_visualizer,article_id").eq("brand_id", dst).eq("slug", slug).maybeSingle();

    // REMOVER da coleção
    if (!assign) {
      if (!existing) return NextResponse.json({ ok: true, assigned: false });
      const articleId = existing.article_id;
      if (existing.in_visualizer) {
        await sb.from("fabrics").update({ collection_id: null, article_id: null }).eq("id", existing.id);
      } else {
        await sb.from("fabrics").delete().eq("id", existing.id);
      }
      // apaga o article se ficou sem cores
      if (articleId) {
        const { count } = await sb.from("fabrics")
          .select("id", { count: "exact", head: true }).eq("article_id", articleId);
        if (!count) await sb.from("fabric_articles").delete().eq("id", articleId);
      }
      return NextResponse.json({ ok: true, assigned: false });
    }

    // ADICIONAR à coleção
    const { data: src } = await sb.from("fabrics")
      .select("name,code,color_name,swatch_url,texture_url,thumb_url,dominant_colors")
      .eq("id", sourceId).maybeSingle();
    if (!src) return NextResponse.json({ error: "source fabric not found" }, { status: 404 });

    const articleId = await ensureArticle(sb, dst, collectionId, src.name);

    if (existing) {
      const { error } = await sb.from("fabrics")
        .update({ collection_id: collectionId, article_id: articleId }).eq("id", existing.id);
      if (error) throw error;
      return NextResponse.json({ ok: true, assigned: true });
    }

    const { error } = await sb.from("fabrics").insert({
      brand_id: dst, slug, collection_id: collectionId, article_id: articleId,
      name: src.name, code: src.code, color_name: src.color_name,
      swatch_url: src.swatch_url, texture_url: src.texture_url, thumb_url: src.thumb_url,
      dominant_colors: src.dominant_colors, in_visualizer: false,
    });
    if (error) throw error;

    return NextResponse.json({ ok: true, assigned: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
