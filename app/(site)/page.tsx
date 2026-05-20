import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { sanityFetch } from "@/sanity/lib/client";
import { homePageQuery } from "@/sanity/lib/queries";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export const revalidate = 60;

export default async function HomePage() {
  const t = await getTranslations("home");
  const data = await sanityFetch<any>({ query: homePageQuery, tags: ["homePage"] }).catch(() => null);

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden bg-ink text-bone">
        {data?.hero?.image?.asset?.url && (
          <Image src={data.hero.image.asset.url} alt="" fill priority className="object-cover opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
        <Container className="relative py-20">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-bone/70 mb-6">{t("hero.eyebrow")}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-display text-[clamp(3rem,9vw,9rem)] leading-[0.95] max-w-5xl whitespace-pre-line">
              {t("hero.title")}
            </h1>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="mt-8 max-w-xl text-base lg:text-lg text-bone/80 text-balance">{t("hero.subtitle")}</p>
          </Reveal>
          <Reveal delay={0.35}>
            <div className="mt-12 flex flex-wrap gap-4">
              <Button variant="bone" asChild><Link href="/collections">{t("hero.ctaPrimary")}</Link></Button>
              <Button variant="outline" className="border-bone text-bone hover:bg-bone hover:text-ink" asChild>
                <Link href="/contact?intent=sample">{t("hero.ctaSecondary")}</Link>
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
            <h2 className="text-display text-5xl lg:text-7xl leading-[1.05]">{t("philosophy.title")}</h2>
          </Reveal>
          <Reveal delay={0.15} className="lg:col-span-6 lg:col-start-7 self-end">
            <p className="text-lg text-ink/80 leading-relaxed text-pretty">{t("philosophy.body")}</p>
          </Reveal>
        </Container>
      </section>

      {/* COLLECTIONS */}
      {data?.featuredCollections?.length > 0 && (
        <section className="py-24 bg-bone">
          <Container>
            <div className="flex justify-between items-end mb-16">
              <h2 className="text-display text-4xl lg:text-6xl">Selected collections</h2>
              <Link href="/collections" className="text-xs uppercase tracking-widest hover:underline">View all →</Link>
            </div>
            <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {data.featuredCollections.map((c: any) => (
                <StaggerItem key={c._id}>
                  <Link href={`/collections/${c.slug.current}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-wool mb-4">
                      {c.image && <Image src={c.image} alt={c.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />}
                    </div>
                    <p className="text-xs uppercase tracking-widest text-stone mb-1">{c.fiber}</p>
                    <h3 className="text-display text-2xl">{c.title}</h3>
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
            <h2 className="text-display text-4xl lg:text-6xl max-w-3xl mb-16 text-balance">{t("industries.title")}</h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-ink/10">
            {(["workplace","hospitality","residential","acoustic","furniture","contract"] as const).map(k => (
              <Link key={k} href={`/industries#${k}`} className="bg-paper p-8 hover:bg-bone transition-colors group">
                <p className="text-xs uppercase tracking-widest text-stone mb-12">{`0${(["workplace","hospitality","residential","acoustic","furniture","contract"].indexOf(k))+1}`}</p>
                <p className="text-display text-2xl group-hover:translate-x-1 transition-transform">{t(`industries.items.${k}`)}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* INTELLIGENCE */}
      {data?.intelligenceFeed?.length > 0 && (
        <section className="py-24 bg-ink text-bone">
          <Container>
            <div className="flex justify-between items-end mb-16">
              <h2 className="text-display text-4xl lg:text-6xl">{t("intelligence.title")}</h2>
              <Link href="/intelligence" className="text-xs uppercase tracking-widest hover:underline">{t("intelligence.cta")} →</Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {data.intelligenceFeed.map((n: any) => (
                <Link key={n._id} href={`/news/${n.slug?.current}`} className="group">
                  <div className="relative aspect-[3/4] overflow-hidden bg-graphite mb-4">
                    {n.image && <Image src={n.image} alt={n.title} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />}
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
            <h2 className="text-display text-5xl lg:text-7xl leading-[1.05] mb-8">{t("sustainability.title")}</h2>
            <p className="text-lg text-bone/80 text-pretty">{t("sustainability.body")}</p>
            <Button variant="outline" className="mt-8 border-bone text-bone hover:bg-bone hover:text-moss" asChild>
              <Link href="/sustainability">Our commitment →</Link>
            </Button>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
