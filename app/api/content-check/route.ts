import { NextResponse } from "next/server";
import { brandId } from "@/lib/content/client";
import { getCollections, getIndustries, getNews, getFabricsByCollection } from "@/lib/content/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Diagnóstico temporário. Confirma que o site fala com o Supabase certo
// e enxerga a marca + tabelas. Abrir /api/content-check e conferir o JSON.
// DELETAR depois da Fase 2.
export async function GET() {
  const env = {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    urlRef: (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/^https:\/\//, "").split(".")[0],
  };

  const bid = await brandId();
  const collections = await getCollections();
  const industries = await getIndustries();
  const news = await getNews();
  const firstCollectionFabrics = collections[0]
    ? await getFabricsByCollection(collections[0].id)
    : [];

  return NextResponse.json({
    env,
    brandIdFound: bid,
    counts: {
      collections: collections.length,
      industries: industries.length,
      news: news.length,
      fabricsInFirstCollection: firstCollectionFabrics.length,
    },
    sampleCollection: collections[0]
      ? { name: collections[0].name, slug: collections[0].slug }
      : null,
  }, { headers: { "cache-control": "no-store" } });
}
