import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils/cn";
import { getNews } from "@/lib/content/queries";
import { Container } from "@/components/ui/container";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export const revalidate = 60;
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://lady-fabrics.vercel.app";

export async function generateMetadata() {
  return {
    title: "News — Lady Fabrics",
    description: "Editorial and market intelligence on textiles, sustainability and contract interiors.",
    alternates: { canonical: `${SITE}/news` },
  };
}

export default async function NewsPage() {
  const items = await getNews(60);
  return (
    <Container className="py-24">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.3em] text-stone mb-6">— Editorial</p>
        <h1 className="text-display text-5xl lg:text-8xl mb-16">News</h1>
      </Reveal>
      <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {items.map(n => (
          <StaggerItem key={n.id}>
            <Link href={`/news/${n.slug}`} className="group block">
              <div className="relative aspect-[4/5] bg-wool overflow-hidden mb-4">
                {n.cover_image_url && <Image src={n.cover_image_url} alt={n.title} fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />}
              </div>
              <p className="text-xs uppercase tracking-widest text-stone mb-2">
                {n.category}{n.category && n.published_at ? " · " : ""}{n.published_at ? formatDate(n.published_at) : ""}
              </p>
              <h2 className="text-display text-2xl">{n.title}</h2>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
      {items.length === 0 && <p className="text-stone text-sm">No articles yet.</p>}
    </Container>
  );
}
