import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const copySlug = (srcId: string) => `lt-${srcId}`.slice(0, 96);

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY missing on the server (Vercel env). Add it from Supabase → Settings → API → service_role." },
      { status: 500 },
    );
  }

  try {
    const { sourceId, enable } = await req.json();
    if (!sourceId) return NextResponse.json({ error: "sourceId required" }, { status: 400 });

    const sb = createServiceClient();

    const { data: brand, error: be } = await sb
      .from("brands").select("id").eq("slug", "lady-fabrics").maybeSingle();
    if (be) throw be;
    if (!brand) {
      return NextResponse.json(
        { error: "brand 'lady-fabrics' not found in this database. Check that SUPABASE_SERVICE_ROLE_KEY points to project cknkqyafuvrjrmiwvlhx." },
        { status: 500 },
      );
    }
    const dst = brand.id;
    const slug = copySlug(sourceId);

    if (!enable) {
      const { error } = await sb.from("fabrics").delete().eq("brand_id", dst).eq("slug", slug);
      if (error) throw error;
      return NextResponse.json({ ok: true, enabled: false });
    }

    const { data: src, error: se } = await sb.from("fabrics")
      .select("name,code,color_name,swatch_url,texture_url,thumb_url,dominant_colors")
      .eq("id", sourceId).maybeSingle();
    if (se) throw se;
    if (!src) return NextResponse.json({ error: "source fabric not found" }, { status: 404 });

    const row = {
      brand_id: dst, slug,
      name: src.name, code: src.code, color_name: src.color_name,
      swatch_url: src.swatch_url, texture_url: src.texture_url, thumb_url: src.thumb_url,
      dominant_colors: src.dominant_colors, in_visualizer: true,
    };

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
