import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ── PREENCHA AQUI ────────────────────────────────────────────────
// Cole as URLs publicas das imagens. Deixe "" ou [] para pular.
const IMAGES: Record<string, { hero: string; gallery: string[] }> = {
  "collection.pure-linen-pure-style": { hero: "", gallery: [] },
  "collection.wool-for-contract":     { hero: "", gallery: [] },
  "collection.synthetics-polyester":  { hero: "", gallery: [] },
  "collection.naturals-cotton-blends":{ hero: "", gallery: [] },
  "collection.in-and-out-indoor-outdoor": { hero: "", gallery: [] },
};
// ─────────────────────────────────────────────────────────────────

async function upload(url: string, filename: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetch ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const asset = await writeClient.assets.upload("image", buf, { filename });
  return asset._id;
}

const ref = (id: string) => ({ _type: "image", asset: { _type: "reference", _ref: id } });

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  if (!process.env.SEED_KEY || key !== process.env.SEED_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return NextResponse.json({ error: "missing SANITY_API_WRITE_TOKEN" }, { status: 500 });
  }

  const report: Record<string, any> = {};

  for (const [docId, cfg] of Object.entries(IMAGES)) {
    const set: any = {};
    try {
      if (cfg.hero) {
        set.heroImage = { ...ref(await upload(cfg.hero, `${docId}-hero.jpg`)), _type: "image" };
      }
      if (cfg.gallery?.length) {
        const ids = [];
        for (let i = 0; i < cfg.gallery.length; i++) {
          ids.push(await upload(cfg.gallery[i], `${docId}-${i + 1}.jpg`));
        }
        set.gallery = ids.map((id, i) => ({ ...ref(id), _key: `g${i}` }));
      }
      if (!Object.keys(set).length) { report[docId] = "skipped (sem URLs)"; continue; }

      await writeClient.patch(docId).set(set).commit();
      report[docId] = { hero: !!set.heroImage, gallery: set.gallery?.length ?? 0 };
    } catch (e: any) {
      report[docId] = `ERROR ${e.message}`;
    }
  }

  return NextResponse.json({ ok: true, report }, { headers: { "cache-control": "no-store" } });
}
