import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getArticleBySlug, getFabricsByArticle, getCollectionBySlug } from "@/lib/content/queries";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export const revalidate = 60;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://lady-fabrics.vercel.app";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; article: string }> }) {
  const { slug, article } = await params;
  const a = await getArticleBySlug(article);
  if (!a) return { title: "Fabric" };
  const title = a.seo_title || `${a.name} — Lady Fabrics`;
  const description = a.seo_description || a.subtitle || undefined;
  const image = a.og_image_url || a.hero_image_url || undefined;
  const url = `${SITE}/collections/${slug}/${article}`;
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title, description, siteName: "Lady Fabrics", images: image ? [{ url: image }] : undefined },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string; article: string }> }) {
  const { slug, article } = await params;
  const a = await getArticleBySlug(article);
  if (!a) notFound();

  const c = await getCollectionBySlug(slug);
  const fabrics = await getFabricsByArticle(a.id);
  const paragraphs = (a.description || "").split("\n\n").filter(Boolean);
  const cover = a.hero_image_url || fabrics[0]?.thumb_url || fabrics[0]?.swatch_url || null;

  const specs: [string, string | null][] = [
    ["Composition", a.composition],
    ["Width", a.width],
    ["Weight", a.weight],
    ["Abrasion", a.abrasion],
    ["Finish", a.finish],
    ["Care", a.care],
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative h-[60vh] bg-ink text-bone overflow-hidden">
        {cover && <Image src={cover} alt={a.name} fill priority className="object-cover opacity-80" />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
        <Container className="relative h-full flex items-end pb-14">
          <Reveal>
            <Link href={`/collections/${slug}`} className="text-xs uppercase tracking-[0.3em] text-bone/70 hover:text-bone">
              ← {c?.name ?? "Collection"}
            </Link>
            <h1 className="text-display text-6xl lg:text-8xl leading-none mt-4">{a.name}</h1>
            {a.subtitle && <p className="mt-4 max-w-xl text-lg text-bone/80">{a.subtitle}</p>}
          </Reveal>
        </Container>
      </section>

      {/* INTRO + SPECS */}
      <Container className="py-20 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-6 text-ink/80">
          {paragraphs.map((p, i) => <p key={i} className="text-lg leading-relaxed">{p}</p>)}
          {a.applications?.length > 0 && (
            <div className="pt-4">
              <p className="text-xs uppercase tracking-widest text-stone mb-3">Applications</p>
              <div className="flex flex-wrap gap-2">
                {a.applications.map(x => (
                  <span key={x} className="px-3 py-1 border border-ink/20 text-xs uppercase tracking-wider">{x}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 lg:col-start-9">
          <dl className="border-t border-ink/10">
            {specs.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-3 border-b border-ink/10">
                <dt className="text-xs uppercase tracking-widest text-stone">{k}</dt>
                <dd className="text-sm text-right">{v}</dd>
              </div>
            ))}
          </dl>
          {a.certifications?.length > 0 && (
            <div className="mt-8">
              <p className="text-xs uppercase tracking-widest text-stone mb-3">Certifications</p>
              <div className="flex flex-wrap gap-2">
                {a.certifications.map(x => (
                  <span key={x} className="px-3 py-1 border border-ink/20 text-xs uppercase tracking-wider">{x}</span>
                ))}
              </div>
            </div>
          )}
          <Button asChild className="w-full mt-8">
            <Link href={`/contact?intent=sample&fabric=${a.slug}`}>Request a sample</Link>
          </Button>
        </aside>
      </Container>

      {/* COLOURS */}
      {fabrics.length > 0 && (
        <section className="py-16 border-t border-ink/10">
          <Container>
            <div className="flex items-baseline justify-between mb-10">
              <h2 className="text-display text-3xl lg:text-4xl">Colours</h2>
              <p className="text-xs uppercase tracking-widest text-stone">{fabrics.length} references</p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-x-4 gap-y-8">
              {fabrics.map(f => (
                <div key={f.id}>
                  <div className="relative aspect-square bg-wool overflow-hidden">
                    {(f.thumb_url || f.swatch_url) && (
                      <Image src={f.thumb_url || f.swatch_url} alt={f.color_name || f.code || a.name}
                        fill sizes="160px" className="object-cover" />
                    )}
                  </div>
                  <p className="text-xs mt-2">{f.code}</p>
                  {f.color_name && <p className="text-[11px] text-stone leading-tight">{f.color_name}</p>}
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* GALLERY */}
      {a.gallery?.length > 0 && (
        <section className="py-16 bg-bone">
          <Container>
            <div className="grid md:grid-cols-2 gap-1">
              {a.gallery.map((src, i) => (
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
