import { NextResponse } from "next/server";
import { readClient, brandId } from "@/lib/content/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Diagnóstico: quantos móveis/tecidos por marca, e quantos estão prontos p/ render.
// Abrir /api/visualizer-check. DELETAR depois.
export async function GET() {
  const sb = readClient();
  const { data: brands } = await sb.from("brands").select("id,slug");
  const out: any = { brands: {}, ladyFabricsBrandId: await brandId() };

  for (const b of brands ?? []) {
    const { data: fur } = await sb.from("furniture")
      .select("id,mask_url").eq("brand_id", (b as any).id);
    const { data: fab } = await sb.from("fabrics")
      .select("id,texture_url,swatch_url,in_visualizer").eq("brand_id", (b as any).id);
    out.brands[(b as any).slug] = {
      furniture_total: fur?.length ?? 0,
      furniture_with_mask: (fur ?? []).filter((f: any) => !!f.mask_url).length,
      fabrics_total: fab?.length ?? 0,
      fabrics_in_visualizer: (fab ?? []).filter((f: any) => f.in_visualizer).length,
      fabrics_with_texture: (fab ?? []).filter((f: any) => f.texture_url || f.swatch_url).length,
    };
  }
  return NextResponse.json(out, { headers: { "cache-control": "no-store" } });
}
