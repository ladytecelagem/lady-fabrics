import { notFound } from "next/navigation";
import Image from "next/image";
import { formatDate } from "@/lib/utils/cn";
import { getNewsBySlug, getNews } from "@/lib/content/queries";
import { Container } from "@/components/ui/container";

export const revalidate = 60;
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://lady-fabrics.vercel.app";

export async function generateStaticParams() {
  const items = await getNews(100);
  return items.map(n => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = await getNewsBySlug(slug);
  if (!n) return { title: "Article" };
  const title = n.seo_title || `${n.title} — Lady Fabrics`;
  const description = n.seo_description || n.excerpt || undefined;
  const image = n.og_image_url || n.cover_image_url || undefined;
  const url = `${SITE}/news/${slug}`;
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: {
      type: "article", url, title, description, siteName: "Lady Fabrics",
      publishedTime: n.published_at || undefined,
      images: image ? [{ url: image, width: 1200, height: 630, alt: n.title }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export default async function NewsDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = await getNewsBySlug(slug);
  if (!n) notFound();

  const paragraphs = (n.body || "").split("\n\n").filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: n.title,
    datePublished: n.published_at || undefined,
    author: n.author_name ? { "@type": "Person", name: n.author_name } : { "@type": "Organization", name: "Lady Fabrics" },
    publisher: { "@type": "Organization", name: "Lady Fabrics" },
    ...(n.cover_image_url ? { image: [n.cover_image_url] } : {}),
    description: n.excerpt || n.seo_description || undefined,
    url: `${SITE}/news/${slug}`,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="relative h-[70vh] bg-ink text-bone overflow-hidden">
        {n.cover_image_url && <Image src={n.cover_image_url} alt={n.title} fill priority className="object-cover opacity-70" />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
        <Container className="relative h-full flex items-end pb-16">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-bone/70 mb-4">
              {n.category}{n.category && n.published_at ? " · " : ""}{n.published_at ? formatDate(n.published_at) : ""}
            </p>
            <h1 className="text-display text-5xl lg:text-8xl leading-[0.95] max-w-4xl">{n.title}</h1>
          </div>
        </Container>
      </section>
      <Container className="py-24 max-w-3xl">
        {n.excerpt && <p className="text-xl text-ink/70 leading-relaxed mb-12">{n.excerpt}</p>}
        <div className="space-y-6 text-lg text-ink/80 leading-relaxed">
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        {n.author_name && (
          <p className="mt-16 pt-8 border-t border-ink/10 text-sm text-stone">By {n.author_name}</p>
        )}
      </Container>
    </article>
  );
}
