import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const copySlug = (srcId: string) => `lt-${srcId}`.slice(0, 96);

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
      .select("id,in_visualizer").eq("brand_id", dst).eq("slug", slug).maybeSingle();

    // REMOVER da coleção
    if (!assign) {
      if (!existing) return NextResponse.json({ ok: true, assigned: false });
      if (existing.in_visualizer) {
        const { error } = await sb.from("fabrics").update({ collection_id: null }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await sb.from("fabrics").delete().eq("id", existing.id);
        if (error) throw error;
      }
      return NextResponse.json({ ok: true, assigned: false });
    }

    // ADICIONAR à coleção
    if (existing) {
      const { error } = await sb.from("fabrics").update({ collection_id: collectionId }).eq("id", existing.id);
      if (error) throw error;
      return NextResponse.json({ ok: true, assigned: true });
    }

    const { data: src } = await sb.from("fabrics")
      .select("name,code,color_name,swatch_url,texture_url,thumb_url,dominant_colors")
      .eq("id", sourceId).maybeSingle();
    if (!src) return NextResponse.json({ error: "source fabric not found" }, { status: 404 });

    const { error } = await sb.from("fabrics").insert({
      brand_id: dst, slug, collection_id: collectionId,
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
