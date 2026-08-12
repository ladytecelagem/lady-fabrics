import { NextRequest, NextResponse } from "next/server";
import { readClient, brandId } from "@/lib/content/client";

export const runtime = "nodejs";

// POST { items } -> cria basket, retorna { id }
// (leitura é feita direto na página /basket/[id] via readClient)
export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "empty basket" }, { status: 400 });
    }
    // sanitizar itens (nunca confiar no client)
    const clean = items.slice(0, 50).map((i: any) => ({
      furnitureId: String(i.furnitureId || ""),
      furnitureName: String(i.furnitureName || "").slice(0, 200),
      fabricId: String(i.fabricId || ""),
      fabricName: String(i.fabricName || "").slice(0, 200),
      fabricCode: i.fabricCode ? String(i.fabricCode).slice(0, 100) : null,
    }));

    const sb = readClient();
    const bid = await brandId();
    const { data, error } = await sb.from("baskets")
      .insert({ brand_id: bid, items: clean })
      .select("id").single();
    if (error) throw error;

    return NextResponse.json({ ok: true, id: data.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
