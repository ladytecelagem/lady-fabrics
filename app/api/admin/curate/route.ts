import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Liga/desliga um tecido de origem (lady-tecelagem) no visualizer da lady-fabrics.
// ON  = upsert de uma copia em lady-fabrics com in_visualizer=true
// OFF = delete da copia
// Chave de idempotencia: a copia guarda o mesmo 'code' e um slug derivado.
async function brandId(sb: any, slug: string): Promise<string | null> {
  const { data } = await sb.from("brands").select("id").eq("slug", slug).single();
  return data?.id ?? null;
}

const copySlug = (srcId: string) => `lt-${srcId}`.slice(0, 96);

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { sourceId, enable } = await req.json();
    if (!sourceId) return NextResponse.json({ error: "sourceId required" }, { status: 400 });

    const sb = createServiceClient();
    const dst = await brandId(sb, "lady-fabrics");
    if (!dst) return NextResponse.json({ error: "lady-fabrics brand not found" }, { status: 500 });

    const slug = copySlug(sourceId);

    if (!enable) {
      const { error } = await sb.from("fabrics").delete().eq("brand_id", dst).eq("slug", slug);
      if (error) throw error;
      return NextResponse.json({ ok: true, enabled: false });
    }

    // buscar o tecido de origem (apenas colunas garantidas)
    const { data: src, error: se } = await sb.from("fabrics")
      .select("name,code,color_name,swatch_url,texture_url,thumb_url,dominant_colors")
      .eq("id", sourceId).single();
    if (se || !src) throw se || new Error("source fabric not found");

    const row = {
      brand_id: dst,
      slug,
      name: src.name,
      code: src.code,
      color_name: src.color_name,
      swatch_url: src.swatch_url,
      texture_url: src.texture_url,
      thumb_url: src.thumb_url,
      dominant_colors: src.dominant_colors,
      in_visualizer: true,
    };

    // upsert por (brand_id, slug)
    const { data: existing } = await sb.from("fabrics")
      .select("id").eq("brand_id", dst).eq("slug", slug).maybeSingle();

    if (existing) {
      const { error } = await sb.from("fabrics").update(row).eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await sb.from("fabrics").insert(row);
      if (error) throw error;
    }
    return NextResponse.json({ ok: true, enabled: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
