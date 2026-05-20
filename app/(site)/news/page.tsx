import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils/cn";
import { sanityFetch } from "@/sanity/lib/client";
import { allNewsQuery } from "@/sanity/lib/queries";
import { Container } from "@/components/ui/container";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export const revalidate = 60;
export async function generateMetadata() { return { title: "News & Intelligence" }; }

export default async function NewsPage() {
  const items = await sanityFetch<any[]>({ query: allNewsQuery, tags: ["news"] }).catch(() => []);
  return (
    <Container className="py-24">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.3em] text-stone mb-6">— Editorial</p>
        <h1 className="text-display text-5xl lg:text-8xl mb-16">News</h1>
      </Reveal>
      <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {items?.map(n => (
          <StaggerItem key={n._id}>
            <Link href={`/news/${n.slug.current}`} className="group block">
              <div className="relative aspect-[4/5] bg-wool overflow-hidden mb-4">
                {n.image && <Image src={n.image} alt={n.title} fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />}
              </div>
              <p className="text-xs uppercase tracking-widest text-stone mb-2">{n.category} · {n.publishedAt ? formatDate(n.publishedAt) : ""}</p>
              <h2 className="text-display text-2xl">{n.title}</h2>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
      {(!items || items.length === 0) && <p className="text-stone text-sm">No articles yet.</p>}
    </Container>
  );
}
