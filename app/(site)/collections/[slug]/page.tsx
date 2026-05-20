import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { sanityFetch } from "@/sanity/lib/client";
import { collectionBySlugQuery } from "@/sanity/lib/queries";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await sanityFetch<any>({ query: collectionBySlugQuery, params: { slug } }).catch(() => null);
  return { title: c?.title || "Collection" };
}

export default async function CollectionDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getTranslations("collections");
  const c = await sanityFetch<any>({ query: collectionBySlugQuery, params: { slug }, tags: [`collection:${slug}`] }).catch(() => null);
  if (!c) notFound();

  return (
    <>
      {/* HERO */}
      <section className="relative h-[80vh] bg-ink text-bone overflow-hidden">
        {c.heroImage && <Image src={c.heroImage} alt={c.title} fill priority className="object-cover opacity-80" />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
        <Container className="relative h-full flex items-end pb-16">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] mb-4 text-bone/70">{c.fiber}</p>
            <h1 className="text-display text-6xl lg:text-9xl leading-none">{c.title}</h1>
          </Reveal>
        </Container>
      </section>

      {/* INTRO + SPECS */}
      <Container className="py-24 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <Reveal>
            <h2 className="text-display text-3xl mb-6">About the collection</h2>
            <div className="prose prose-neutral max-w-none text-ink/80">
              {/* portable text would render here */}
            </div>
          </Reveal>
        </div>
        <aside className="lg:col-span-4 lg:col-start-9 space-y-12">
          {c.composition && (
            <div>
              <p className="text-xs uppercase tracking-widest text-stone mb-3">{t("composition")}</p>
              <p className="text-lg">{c.composition}</p>
            </div>
          )}
          {c.specifications?.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-stone mb-3">{t("specs")}</p>
              <dl className="space-y-3">
                {c.specifications.map((s: any, i: number) => (
                  <div key={i} className="flex justify-between border-b border-ink/10 pb-2 text-sm">
                    <dt className="text-stone">{s.label}</dt>
                    <dd>{s.value} {s.unit}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {c.applications?.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-stone mb-3">{t("applications")}</p>
              <div className="flex flex-wrap gap-2">
                {c.applications.map((a: string) => (
                  <span key={a} className="px-3 py-1 border border-ink/20 text-xs uppercase tracking-wider">{a}</span>
                ))}
              </div>
            </div>
          )}
          <div className="pt-4">
            <Button asChild className="w-full"><Link href={`/contact?intent=sample&collection=${c.slug.current}`}>{t("requestSample")}</Link></Button>
          </div>
        </aside>
      </Container>

      {/* GALLERY */}
      {c.gallery?.length > 0 && (
        <section className="py-16 bg-bone">
          <Container>
            <div className="grid md:grid-cols-2 gap-1">
              {c.gallery.map((src: string, i: number) => (
                <div key={i} className="relative aspect-[4/5] bg-wool">
                  <Image src={src} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* SAMPLE BOOK */}
      {c.sampleBook && (
        <section className="py-24">
          <Container>
            <Reveal>
              <p className="text-xs uppercase tracking-[0.3em] text-stone mb-6">— Digital cartela</p>
              <h2 className="text-display text-4xl lg:text-6xl mb-8">{c.sampleBook.title}</h2>
              <Button asChild><Link href={`/sample-books/${c.sampleBook.slug.current}`}>Browse cartela →</Link></Button>
            </Reveal>
          </Container>
        </section>
      )}

      {/* DOWNLOADS */}
      {c.downloads?.length > 0 && (
        <section className="py-16 bg-bone">
          <Container>
            <p className="text-xs uppercase tracking-widest text-stone mb-6">{t("downloads")}</p>
            <ul className="divide-y divide-ink/10 border-y border-ink/10">
              {c.downloads.map((d: any, i: number) => (
                <li key={i}>
                  <a href={d.url} download className="flex justify-between py-4 hover:bg-paper px-2 transition-colors">
                    <span>{d.title}</span>
                    <span className="text-xs text-stone uppercase">PDF ↓</span>
                  </a>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* RELATED */}
      {c.related?.length > 0 && (
        <section className="py-24">
          <Container>
            <h2 className="text-display text-3xl mb-12">{t("related")}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {c.related.map((r: any) => (
                <Link key={r._id} href={`/collections/${r.slug.current}`} className="group block">
                  <div className="relative aspect-[4/5] bg-wool overflow-hidden mb-3">
                    {r.image && <Image src={r.image} alt={r.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />}
                  </div>
                  <h3 className="text-display text-xl">{r.title}</h3>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
