import Link from "next/link";
import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { sanityFetch } from "@/sanity/lib/client";
import { allCollectionsQuery } from "@/sanity/lib/queries";
import { lf } from "@/lib/i18n/locale-field";
import { Container } from "@/components/ui/container";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export const revalidate = 60;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://lady-fabrics.vercel.app";

export async function generateMetadata() {
  const title = "Collections — Lady Fabrics";
  const description =
    "Linen, wool, cotton, performance polyester and indoor-outdoor textiles. Contract-grade collections specified for architecture, hospitality and workplace interiors.";
  return {
    title,
    description,
    alternates: { canonical: `${SITE}/collections` },
    openGraph: { type: "website", url: `${SITE}/collections`, title, description, siteName: "Lady Fabrics" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CollectionsPage() {
  const t = await getTranslations("collections");
  const locale = await getLocale();
  const items = await sanityFetch<any[]>({ query: allCollectionsQuery, tags: ["collection"] }).catch(() => []);

  return (
    <Container className="py-24">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.3em] text-stone mb-6">— {t("title")}</p>
        <h1 className="text-display text-5xl lg:text-8xl mb-8">{t("title")}</h1>
        <p className="max-w-2xl text-lg lg:text-xl text-ink/70 leading-relaxed mb-20">
          Five material families, one standard of specification. Each collection is developed for
          environments where textile decisions are architectural decisions — not finishing touches.
        </p>
      </Reveal>

      <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
        {items?.map(c => (
          <StaggerItem key={c._id}>
            <Link href={`/collections/${c.slug.current}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-wool mb-4">
                {c.image && <Image src={c.image} alt={c.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />}
              </div>
              <p className="text-xs uppercase tracking-widest text-stone mb-1">{c.fiber}</p>
              <h2 className="text-display text-3xl">{c.title}</h2>
              {lf<string>(c.tagline, locale) && (
                <p className="text-sm text-ink/60 mt-2 leading-relaxed">{lf<string>(c.tagline, locale)}</p>
              )}
              {c.applications?.length > 0 && (
                <p className="text-xs text-stone mt-3 uppercase tracking-wider">{c.applications.join(" · ")}</p>
              )}
            </Link>
          </StaggerItem>
        ))}
      </Stagger>

      {(!items || items.length === 0) && (
        <p className="text-stone text-sm">Collections will appear here once published in Sanity Studio.</p>
      )}
    </Container>
  );
}
