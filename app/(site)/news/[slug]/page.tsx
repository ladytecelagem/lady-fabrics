import { notFound } from "next/navigation";
import Image from "next/image";
import { formatDate } from "@/lib/utils/cn";
import { sanityFetch } from "@/sanity/lib/client";
import { newsBySlugQuery } from "@/sanity/lib/queries";
import { Container } from "@/components/ui/container";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = await sanityFetch<any>({ query: newsBySlugQuery, params: { slug } }).catch(() => null);
  return { title: n?.title || "Article" };
}

export default async function NewsDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = await sanityFetch<any>({ query: newsBySlugQuery, params: { slug }, tags: [`news:${slug}`] }).catch(() => null);
  if (!n) notFound();

  return (
    <article>
      <section className="relative h-[70vh] bg-ink text-bone overflow-hidden">
        {n.image && <Image src={n.image} alt={n.title} fill priority className="object-cover opacity-70" />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
        <Container className="relative h-full flex items-end pb-16">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-bone/70 mb-4">{n.category} · {n.publishedAt ? formatDate(n.publishedAt) : ""}</p>
            <h1 className="text-display text-5xl lg:text-8xl leading-[0.95] max-w-4xl">{n.title}</h1>
          </div>
        </Container>
      </section>
      <Container className="py-24 max-w-3xl">
        <div className="prose prose-neutral prose-lg">
          {/* portable text rendering: replace with @portabletext/react if rich body shipped */}
        </div>
      </Container>
    </article>
  );
}
