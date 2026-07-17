import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/client";
import { requireAdmin } from "@/lib/auth/admin";

export const runtime = "nodejs";

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 96);

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return NextResponse.json({ error: "missing SANITY_API_WRITE_TOKEN" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { name, collectionId, code, composition, weight, width, description, care, certifications, colorways } = body;

    if (!name || !collectionId) {
      return NextResponse.json({ error: "name and collectionId are required" }, { status: 400 });
    }

    const slug = slugify(body.slug || name);
    const _id = `fabric.${slug}`;

    const doc = {
      _id,
      _type: "fabric",
      name,
      slug: { _type: "slug", current: slug },
      code: code || undefined,
      collection: { _type: "reference", _ref: collectionId },
      order: 100,
      composition: composition || undefined,
      weight: typeof weight === "number" ? weight : undefined,
      width: typeof width === "number" ? width : undefined,
      description: description || undefined,
      care: care || undefined,
      certifications: Array.isArray(certifications) && certifications.length ? certifications : undefined,
      colorways: Array.isArray(colorways)
        ? colorways.map((c: any, i: number) => ({
            _type: "colorway",
            _key: `cw${i}`,
            name: c.name,
            code: c.code || undefined,
            hex: c.hex || undefined,
          }))
        : undefined,
    };

    await writeClient.createOrReplace(doc);

    return NextResponse.json({ ok: true, _id, slug, colorways: doc.colorways?.length ?? 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
