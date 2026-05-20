import { groq } from "next-sanity";

export const homePageQuery = groq`*[_type == "homePage"][0]{
  hero, philosophy, featuredCollections[]->{ _id, title, slug, "image": heroImage.asset->url, fiber },
  featuredIndustries[]->{ _id, name, slug, "image": image.asset->url },
  intelligenceFeed[0...3]->{ _id, title, slug, publishedAt, "image": coverImage.asset->url },
  sustainabilityBlock
}`;

export const allCollectionsQuery = groq`*[_type == "collection" && !(_id in path("drafts.**"))] | order(order asc, title asc){
  _id, title, slug, fiber, applications,
  "image": heroImage.asset->url,
  "thumbnails": gallery[0...3].asset->url
}`;

export const collectionBySlugQuery = groq`*[_type == "collection" && slug.current == $slug][0]{
  _id, title, slug, fiber, applications, story, composition, specifications,
  "heroImage": heroImage.asset->url,
  "gallery": gallery[].asset->url,
  "downloads": downloads[]{ title, "url": file.asset->url, "size": file.asset->size },
  "sampleBook": sampleBook->{ _id, title, slug, "coverUrl": cover.asset->url },
  "related": related[]->{ _id, title, slug, "image": heroImage.asset->url }
}`;

export const allSampleBooksQuery = groq`*[_type == "sampleBook"] | order(_createdAt desc){
  _id, title, slug, description, pageCount, "coverUrl": cover.asset->url,
  "collection": collection->{ title, slug }
}`;

export const sampleBookBySlugQuery = groq`*[_type == "sampleBook" && slug.current == $slug][0]{
  _id, title, slug, description, pageCount,
  "coverUrl": cover.asset->url,
  "pdfUrl": pdf.asset->url,
  pages[]{ pageNumber, "imageUrl": image.asset->url, patterns, notes },
  "collection": collection->{ title, slug }
}`;

export const allNewsQuery = groq`*[_type == "newsItem"] | order(publishedAt desc){
  _id, title, slug, excerpt, publishedAt, category,
  "image": coverImage.asset->url
}`;

export const newsBySlugQuery = groq`*[_type == "newsItem" && slug.current == $slug][0]{
  _id, title, slug, excerpt, publishedAt, category, body,
  "image": coverImage.asset->url, "author": author->{ name, role }
}`;

export const allIndustriesQuery = groq`*[_type == "industry"] | order(order asc){
  _id, name, slug, description, "image": image.asset->url
}`;

export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]{
  contactEmail, contactPhone, address, social, seo
}`;
