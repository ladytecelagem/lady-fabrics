import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { sanityFetch } from "@/sanity/lib/client";
import { allCollectionsQuery } from "@/sanity/lib/queries";
import { Container } from "@/components/ui/container";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export const revalidate = 60;

export async function generateMetadata() {
  return { title: "Collections" };
}

export default async function CollectionsPage() {
  const t = await getTranslations("collections");
  const items = await sanityFetch<any[]>({ query: allCollectionsQuery, tags: ["collection"] }).catch(() => []);

  return (
    <Container className="py-24">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.3em] text-stone mb-6">— {t("title")}</p>
        <h1 className="text-display text-5xl lg:text-8xl mb-16">{t("title")}</h1>
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
              {c.applications?.length > 0 && (
                <p className="text-xs text-stone mt-2">{c.applications.join(" · ")}</p>
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
