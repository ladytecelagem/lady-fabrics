import type { MetadataRoute } from "next";
import { sanityFetch } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { siteConfig } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const staticPages = ["", "/about", "/heritage", "/collections", "/sample-books", "/industries", "/intelligence", "/news", "/sustainability", "/contact"];

  const dynamicData = await sanityFetch<any>({
    query: groq`{
      "collections": *[_type=="collection"]{ "slug": slug.current, _updatedAt },
      "sampleBooks": *[_type=="sampleBook"]{ "slug": slug.current, _updatedAt },
      "news": *[_type=="newsItem"]{ "slug": slug.current, _updatedAt },
    }`,
  }).catch(() => ({ collections: [], sampleBooks: [], news: [] }));

  const dyn = [
    ...dynamicData.collections.map((c: any) => ({ url: `${base}/collections/${c.slug}`, lastModified: c._updatedAt })),
    ...dynamicData.sampleBooks.map((c: any) => ({ url: `${base}/sample-books/${c.slug}`, lastModified: c._updatedAt })),
    ...dynamicData.news.map((c: any) => ({ url: `${base}/news/${c.slug}`, lastModified: c._updatedAt })),
  ];

  return [
    ...staticPages.map(p => ({ url: `${base}${p}`, lastModified: new Date() })),
    ...dyn,
  ];
}
