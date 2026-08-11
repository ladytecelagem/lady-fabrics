import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCollectionBySlug, getCollectionSlugs, getFabricsByCollection } from "@/lib/content/queries";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export const revalidate = 60;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://lady-fabrics.vercel.app";

export async function generateStaticParams() {
  const slugs = await getCollectionSlugs();
  return slugs.map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCollectionBySlug(slug);
  if (!c) return { title: "Collection" };

  const title = c.seo_title || `${c.name} — Lady Fabrics`;
  const description = c.seo_description || c.tagline || undefined;
  const image = c.og_image_url || c.hero_image_url || undefined;
  const url = `${SITE}/collections/${slug}`;

  return {
    title, description,
    alternates: { canonical: url },
    openGraph: {
      type: "article", url, title, description, siteName: "Lady Fabrics",
      images: image ? [{ url: image, width: 1200, height: 630, alt: c.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export default async function CollectionDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCollectionBySlug(slug);
  if (!c) notFound();

  const fabrics = await getFabricsByCollection(c.id);
  const paragraphs = (c.story || "").split("\n\n").filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: c.name,
    description: c.seo_description || c.tagline || undefined,
    url: `${SITE}/collections/${slug}`,
    ...(c.hero_image_url ? { image: [c.hero_image_url] } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO */}
      <section className="relative h-[80vh] bg-ink text-bone overflow-hidden">
        {c.hero_image_url && <Image src={c.hero_image_url} alt={c.name} fill priority className="object-cover opacity-80" />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
        <Container className="relative h-full flex items-end pb-16">
          <Reveal>
            {c.fiber && <p className="text-xs uppercase tracking-[0.3em] mb-4 text-bone/70">{c.fiber}</p>}
            <h1 className="text-display text-6xl lg:text-9xl leading-none">{c.name}</h1>
            {c.tagline && <p className="mt-6 max-w-xl text-lg text-bone/80">{c.tagline}</p>}
          </Reveal>
        </Container>
      </section>

      {/* INTRO + SPECS */}
      <Container className="py-24 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <Reveal>
            <div className="max-w-none text-ink/80 space-y-6">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-lg leading-relaxed">{p}</p>
              ))}
            </div>
          </Reveal>
        </div>
        <aside className="lg:col-span-4 lg:col-start-9 space-y-12">
          {c.applications?.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-stone mb-3">Applications</p>
              <div className="flex flex-wrap gap-2">
                {c.applications.map(a => (
                  <span key={a} className="px-3 py-1 border border-ink/20 text-xs uppercase tracking-wider">{a}</span>
                ))}
              </div>
            </div>
          )}
          <div className="pt-4">
            <Button asChild className="w-full">
              <Link href={`/contact?intent=sample&collection=${c.slug}`}>Request a sample</Link>
            </Button>
          </div>
        </aside>
      </Container>

      {/* FABRICS */}
      {fabrics.length > 0 && (
        <section className="py-16 border-t border-ink/10">
          <Container>
            <div className="flex items-baseline justify-between mb-12">
              <h2 className="text-display text-3xl lg:text-5xl">Fabrics</h2>
              <p className="text-xs uppercase tracking-widest text-stone">{fabrics.length} references</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {fabrics.map(f => (
                <div key={f.id} className="group block">
                  <div className="relative aspect-square bg-wool overflow-hidden mb-3">
                    {(f.thumb_url || f.swatch_url) && (
                      <Image src={f.thumb_url || f.swatch_url} alt={f.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    )}
                  </div>
                  <h3 className="text-lg leading-tight">{f.name}</h3>
                  {f.code && <p className="text-xs uppercase tracking-widest text-stone mt-1">{f.code}</p>}
                  {f.composition && <p className="text-xs text-ink/50 mt-1">{f.composition}</p>}
                  {f.dominant_colors?.length > 0 && (
                    <div className="flex items-center gap-1 mt-3">
                      {f.dominant_colors.slice(0, 6).map((cw, i) => (
                        <span key={i} title={cw.hex}
                          className="w-4 h-4 rounded-full border border-ink/15"
                          style={{ backgroundColor: cw.hex }} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* GALLERY */}
      {c.gallery?.length > 0 && (
        <section className="py-16 bg-bone">
          <Container>
            <div className="grid md:grid-cols-2 gap-1">
              {c.gallery.map((src, i) => (
                <div key={i} className="relative aspect-[4/5] bg-wool">
                  <Image src={src} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
