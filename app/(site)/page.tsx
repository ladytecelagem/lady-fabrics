import Link from "next/link";
import Image from "next/image";
import { getPage, getCollections, getNews } from "@/lib/content/queries";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export const revalidate = 60;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://lady-fabrics.vercel.app";

// Fallbacks — a Home renderiza igual mesmo sem a linha 'home' em pages.
const FB = {
  eyebrow: "Architectural textile intelligence",
  title: "Materials that\nshape space.",
  subtitle: "Premium wool, linen and contract textiles engineered for the world's most considered interiors.",
  heroCtaPrimary: "Explore collections",
  heroCtaSecondary: "Request samples",
  philosophyTitle: "Texture as architecture",
  philosophyBody: "Every fibre, every weave, every finish answers a brief written by the space it inhabits. We make textiles for people who specify with intention.",
  industriesTitle: "Built for environments that demand more",
  intelligenceTitle: "Market Intelligence",
  sustainabilityTitle: "Material responsibility",
  sustainabilityBody: "Wool that returns to earth. Linen grown without compromise.",
};

const INDUSTRIES = ["workplace", "hospitality", "residential", "acoustic", "furniture", "contract"] as const;
const INDUSTRY_LABEL: Record<string, string> = {
  workplace: "Workplace", hospitality: "Hospitality", residential: "Residential",
  acoustic: "Acoustic", furniture: "Furniture", contract: "Contract",
};

export async function generateMetadata() {
  const page = await getPage("home");
  const title = page?.seo_title || "Lady Fabrics — Architectural Textile Intelligence";
  const description = page?.seo_description || FB.subtitle;
  return {
    title, description,
    alternates: { canonical: SITE },
    openGraph: { type: "website", url: SITE, siteName: "Lady Fabrics", title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function HomePage() {
  const [page, collections, news] = await Promise.all([
    getPage("home"),
    getCollections(),
    getNews(3),
  ]);

  const s = { ...FB, ...(page?.sections ?? {}) } as typeof FB & Record<string, string>;
  const eyebrow = page?.eyebrow || FB.eyebrow;
  const title = page?.title || FB.title;
  const subtitle = page?.subtitle || FB.subtitle;
  const hero = page?.hero_image_url;
  const featured = collections.slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden bg-ink text-bone">
        {hero && <Image src={hero} alt="" fill priority className="object-cover opacity-70" />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
        <Container className="relative py-20">
          <Reveal><p className="text-xs uppercase tracking-[0.3em] text-bone/70 mb-6">{eyebrow}</p></Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-display text-[clamp(3rem,9vw,9rem)] leading-[0.95] max-w-5xl whitespace-pre-line">{title}</h1>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="mt-8 max-w-xl text-base lg:text-lg text-bone/80 text-balance">{subtitle}</p>
          </Reveal>
          <Reveal delay={0.35}>
            <div className="mt-12 flex flex-wrap gap-4">
              <Button variant="bone" asChild><Link href="/collections">{s.heroCtaPrimary}</Link></Button>
              <Button variant="outline" className="border-bone text-bone hover:bg-bone hover:text-ink" asChild>
                <Link href="/contact?intent=sample">{s.heroCtaSecondary}</Link>
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* PHILOSOPHY */}
      <section className="py-32">
        <Container className="grid lg:grid-cols-12 gap-12">
          <Reveal className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] text-stone mb-6">— Philosophy</p>
            <h2 className="text-display text-5xl lg:text-7xl leading-[1.05]">{s.philosophyTitle}</h2>
          </Reveal>
          <Reveal delay={0.15} className="lg:col-span-6 lg:col-start-7 self-end">
            <p className="text-lg text-ink/80 leading-relaxed text-pretty">{s.philosophyBody}</p>
          </Reveal>
        </Container>
      </section>

      {/* COLLECTIONS */}
      {featured.length > 0 && (
        <section className="py-24 bg-bone">
          <Container>
            <div className="flex justify-between items-end mb-16">
              <h2 className="text-display text-4xl lg:text-6xl">Selected collections</h2>
              <Link href="/collections" className="text-xs uppercase tracking-widest hover:underline">View all →</Link>
            </div>
            <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {featured.map(c => (
                <StaggerItem key={c.id}>
                  <Link href={`/collections/${c.slug}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-wool mb-4">
                      {c.hero_image_url && <Image src={c.hero_image_url} alt={c.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />}
                    </div>
                    {c.fiber && <p className="text-xs uppercase tracking-widest text-stone mb-1">{c.fiber}</p>}
                    <h3 className="text-display text-2xl">{c.name}</h3>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </section>
      )}

      {/* INDUSTRIES */}
      <section className="py-32">
        <Container>
          <Reveal>
            <h2 className="text-display text-4xl lg:text-6xl max-w-3xl mb-16 text-balance">{s.industriesTitle}</h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-ink/10">
            {INDUSTRIES.map((k, i) => (
              <Link key={k} href={`/industries#${k}`} className="bg-paper p-8 hover:bg-bone transition-colors group">
                <p className="text-xs uppercase tracking-widest text-stone mb-12">{`0${i + 1}`}</p>
                <p className="text-display text-2xl group-hover:translate-x-1 transition-transform">{INDUSTRY_LABEL[k]}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* INTELLIGENCE */}
      {news.length > 0 && (
        <section className="py-24 bg-ink text-bone">
          <Container>
            <div className="flex justify-between items-end mb-16">
              <h2 className="text-display text-4xl lg:text-6xl">{s.intelligenceTitle}</h2>
              <Link href="/intelligence" className="text-xs uppercase tracking-widest hover:underline">Read the latest →</Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {news.map(n => (
                <Link key={n.id} href={`/news/${n.slug}`} className="group">
                  <div className="relative aspect-[3/4] overflow-hidden bg-graphite mb-4">
                    {n.cover_image_url && <Image src={n.cover_image_url} alt={n.title} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />}
                  </div>
                  <h3 className="text-display text-xl">{n.title}</h3>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* SUSTAINABILITY */}
      <section className="py-32 bg-moss text-bone">
        <Container className="grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-bone/60 mb-6">— Material responsibility</p>
            <h2 className="text-display text-5xl lg:text-7xl leading-[1.05] mb-8">{s.sustainabilityTitle}</h2>
            <p className="text-lg text-bone/80 text-pretty">{s.sustainabilityBody}</p>
            <Button variant="outline" className="mt-8 border-bone text-bone hover:bg-bone hover:text-moss" asChild>
              <Link href="/sustainability">Our commitment →</Link>
            </Button>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
