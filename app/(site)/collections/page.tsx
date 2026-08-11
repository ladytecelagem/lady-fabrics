import Link from "next/link";
import Image from "next/image";
import { getCollections } from "@/lib/content/queries";
import { Container } from "@/components/ui/container";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export const revalidate = 60;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://lady-fabrics.vercel.app";

export const metadata = {
  title: "Collections — Lady Fabrics",
  description:
    "Linen, wool, cotton, performance polyester and indoor-outdoor textiles. Contract-grade collections specified for architecture, hospitality and workplace interiors.",
  alternates: { canonical: `${SITE}/collections` },
  openGraph: {
    type: "website", url: `${SITE}/collections`, siteName: "Lady Fabrics",
    title: "Collections — Lady Fabrics",
    description: "Contract-grade textile collections for architecture, hospitality and workplace interiors.",
  },
};

export default async function CollectionsPage() {
  const items = await getCollections();

  return (
    <Container className="py-24">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.3em] text-stone mb-6">— Collections</p>
        <h1 className="text-display text-5xl lg:text-8xl mb-8">Collections</h1>
        <p className="max-w-2xl text-lg lg:text-xl text-ink/70 leading-relaxed mb-20">
          Five material families, one standard of specification. Each collection is developed for
          environments where textile decisions are architectural decisions — not finishing touches.
        </p>
      </Reveal>

      <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
        {items.map(c => (
          <StaggerItem key={c.id}>
            <Link href={`/collections/${c.slug}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-wool mb-4">
                {c.hero_image_url && (
                  <Image src={c.hero_image_url} alt={c.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                )}
              </div>
              {c.fiber && <p className="text-xs uppercase tracking-widest text-stone mb-1">{c.fiber}</p>}
              <h2 className="text-display text-3xl">{c.name}</h2>
              {c.tagline && <p className="text-sm text-ink/60 mt-2 leading-relaxed">{c.tagline}</p>}
              {c.applications?.length > 0 && (
                <p className="text-xs text-stone mt-3 uppercase tracking-wider">{c.applications.join(" · ")}</p>
              )}
            </Link>
          </StaggerItem>
        ))}
      </Stagger>

      {items.length === 0 && (
        <p className="text-stone text-sm">Collections will appear here once published.</p>
      )}
    </Container>
  );
}
