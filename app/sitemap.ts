import type { MetadataRoute } from "next";
import { getCollectionSlugs, getNews } from "@/lib/content/queries";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://lady-fabrics.vercel.app";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    "", "/about", "/heritage", "/collections", "/industries",
    "/intelligence", "/news", "/sustainability", "/contact", "/visualizer",
  ];

  const [collections, news] = await Promise.all([
    getCollectionSlugs(),
    getNews(200),
  ]);

  const now = new Date();

  return [
    ...staticPages.map(p => ({ url: `${base}${p}`, lastModified: now })),
    ...collections.map(c => ({ url: `${base}/collections/${c.slug}`, lastModified: now })),
    ...news.map(n => ({ url: `${base}/news/${n.slug}`, lastModified: n.published_at ? new Date(n.published_at) : now })),
  ];
}
