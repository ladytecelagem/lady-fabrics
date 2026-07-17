import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/client";
import { fabricBySlugQuery } from "@/sanity/lib/queries";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export const revalidate = 60;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://lady-fabrics.vercel.app";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = await sanityFetch<any>({ query: fabricBySlugQuery, params: { slug } }).catch(() => null);
  if (!f) return { title: "Fabric" };

  const title = `${f.name}${f.code ? ` ${f.code}` : ""} — ${f.collection?.title ?? "Lady Fabrics"}`;
  const description =
    f.description ||
    [f.composition, f.width ? `${f.width} cm` : null, f.martindale ? `${f.martindale} cycles Martindale` : null]
      .filter(Boolean).join(" · ") || undefined;
  const url = `${SITE}/fabrics/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article", url, title, description, siteName: "Lady Fabrics",
      images: f.image ? [{ url: f.image, width: 1200, height: 630, alt: f.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: f.image ? [f.image] : undefined },
  };
}

export default async function FabricDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = await sanityFetch<any>({ query: fabricBySlugQuery, params: { slug }, tags: [`fabric:${slug}`] }).catch(() => null);
  if (!f) notFound();

  const specs: [string, string][] = [
    ["Composition", f.composition],
    ["Weight", f.weight ? `${f.weight} g/m²` : ""],
    ["Width", f.width ? `${f.width} cm` : ""],
    ["Abrasion", f.martindale ? `${f.martindale.toLocaleString("en-US")} cycles (Martindale)` : ""],
    ["Care", f.care],
  ].filter(([, v]) => !!v) as [string, string][];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: f.name,
    sku: f.code || undefined,
    description: f.description || undefined,
    material: f.composition || undefined,
    brand: { "@type": "Brand", name: "Lady Fabrics" },
    isPartOf: f.collection?.title,
    ...(f.image ? { image: [f.image] } : {}),
    url: `${SITE}/fabrics/${slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Container className="py-16 lg:py-24">
        {f.collection && (
          <Link
            href={`/collections/${f.collection.slug.current}`}
            className="text-xs uppercase tracking-[0.3em] text-stone hover:text-ink transition-colors"
          >
            ← {f.collection.title}
          </Link>
        )}

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 mt-8">
          {/* IMAGES */}
          <div className="lg:col-span-7 space-y-1">
            <div className="relative aspect-[4/3] bg-wool overflow-hidden">
              {f.image && <Image src={f.image} alt={f.name} fill priority className="object-cover" />}
            </div>
            {f.gallery?.length > 0 && (
              <div className="grid grid-cols-3 gap-1">
                {f.gallery.map((src: string, i: number) => (
                  <div key={i} className="relative aspect-square bg-wool">
                    <Image src={src} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="lg:col-span-5 space-y-10">
            <Reveal>
              {f.code && <p className="text-xs uppercase tracking-[0.3em] text-stone mb-3">{f.code}</p>}
              <h1 className="text-display text-4xl lg:text-6xl leading-none">{f.name}</h1>
              {f.description && (
                <p className="mt-6 text-lg text-ink/70 leading-relaxed">{f.description}</p>
              )}
            </Reveal>

            {specs.length > 0 && (
              <dl className="border-t border-ink/10">
                {specs.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 border-b border-ink/10 py-3 text-sm">
                    <dt className="text-stone whitespace-nowrap">{k}</dt>
                    <dd className="text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            {f.certifications?.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-stone mb-3">Standards</p>
                <div className="flex flex-wrap gap-2">
                  {f.certifications.map((c: string) => (
                    <span key={c} className="px-3 py-1 border border-ink/20 text-xs uppercase tracking-wider">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {f.colorways?.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-stone mb-4">
                  Colorways <span className="text-ink/40">({f.colorways.length})</span>
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-x-3 gap-y-5">
                  {f.colorways.map((cw: any, i: number) => (
                    <div key={i}>
                      <div
                        className="relative aspect-square overflow-hidden border border-ink/10"
                        style={!cw.swatch && cw.hex ? { backgroundColor: cw.hex } : undefined}
                      >
                        {cw.swatch && <Image src={cw.swatch} alt={cw.name} fill className="object-cover" />}
                      </div>
                      <p className="text-[11px] mt-2 leading-tight">{cw.name}</p>
                      {cw.code && <p className="text-[11px] text-stone leading-tight">{cw.code}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button asChild className="w-full">
              <Link href={`/contact?intent=sample&fabric=${f.slug.current}`}>Request a sample</Link>
            </Button>
          </div>
        </div>

        {/* SIBLINGS */}
        {f.siblings?.length > 0 && (
          <section className="mt-24 pt-16 border-t border-ink/10">
            <h2 className="text-display text-2xl mb-8">More from {f.collection?.title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {f.siblings.map((s: any) => (
                <Link key={s._id} href={`/fabrics/${s.slug.current}`} className="group block">
                  <div className="relative aspect-square bg-wool overflow-hidden mb-2">
                    {s.image && <Image src={s.image} alt={s.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />}
                  </div>
                  <p className="text-sm">{s.name}</p>
                  {s.code && <p className="text-xs text-stone">{s.code}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}
      </Container>
    </>
  );
}
