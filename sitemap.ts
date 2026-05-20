import Link from "next/link";
import Image from "next/image";
import { sanityFetch } from "@/sanity/lib/client";
import { allNewsQuery } from "@/sanity/lib/queries";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { formatDate } from "@/lib/utils/cn";

export const revalidate = 60;
export async function generateMetadata() { return { title: "Market Intelligence" }; }

export default async function IntelligencePage() {
  const items = await sanityFetch<any[]>({ query: allNewsQuery }).catch(() => []);
  const grouped = (items || []).reduce<Record<string, any[]>>((acc, n) => {
    const k = n.category || "general"; (acc[k] ||= []).push(n); return acc;
  }, {});

  return (
    <Container className="py-24">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.3em] text-stone mb-6">— Intelligence</p>
        <h1 className="text-display text-5xl lg:text-8xl mb-6">Market Intelligence</h1>
        <p className="max-w-xl text-stone mb-20">Curated insights on textile trends, sustainability, workplace, hospitality, acoustic environments and wool/linen markets.</p>
      </Reveal>

      <div className="space-y-20">
        {Object.entries(grouped).map(([cat, list]) => (
          <section key={cat}>
            <h2 className="text-display text-3xl mb-8 uppercase">{cat}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {list.slice(0, 3).map(n => (
                <Link key={n._id} href={`/news/${n.slug.current}`} className="group block">
                  <div className="relative aspect-[4/5] bg-wool overflow-hidden mb-3">
                    {n.image && <Image src={n.image} alt={n.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />}
                  </div>
                  <p className="text-xs uppercase tracking-widest text-stone mb-1">{n.publishedAt ? formatDate(n.publishedAt) : ""}</p>
                  <h3 className="text-display text-xl">{n.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Container>
  );
}
