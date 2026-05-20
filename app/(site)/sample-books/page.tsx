import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { sanityFetch } from "@/sanity/lib/client";
import { allSampleBooksQuery } from "@/sanity/lib/queries";
import { Container } from "@/components/ui/container";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export const revalidate = 60;
export async function generateMetadata() { return { title: "Digital Sample Books" }; }

export default async function SampleBooksPage() {
  const t = await getTranslations("sampleBooks");
  const items = await sanityFetch<any[]>({ query: allSampleBooksQuery, tags: ["sampleBook"] }).catch(() => []);

  return (
    <Container className="py-24">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.3em] text-stone mb-6">— Digital library</p>
        <h1 className="text-display text-5xl lg:text-8xl mb-6">{t("title")}</h1>
        <p className="max-w-xl text-stone mb-16">{t("subtitle")}</p>
      </Reveal>

      <Stagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
        {items?.map(b => (
          <StaggerItem key={b._id}>
            <Link href={`/sample-books/${b.slug.current}`} className="group block">
              <div className="relative aspect-[3/4] bg-wool overflow-hidden shadow-lg mb-4">
                {b.coverUrl && <Image src={b.coverUrl} alt={b.title} fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />}
              </div>
              <h2 className="text-display text-xl">{b.title}</h2>
              {b.pageCount && <p className="text-xs text-stone mt-1">{b.pageCount} pages</p>}
            </Link>
          </StaggerItem>
        ))}
      </Stagger>

      {(!items || items.length === 0) && (
        <p className="text-stone text-sm">Sample books will appear here once uploaded via the admin area.</p>
      )}
    </Container>
  );
}
