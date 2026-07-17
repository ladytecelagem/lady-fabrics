import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import { apiVersion, dataset, projectId, readToken } from "@/sanity/env";

export const client = createClient({
  projectId, dataset, apiVersion,
  useCdn: false,
  perspective: "published",
  stega: false,
});

export const writeClient = createClient({
  projectId, dataset, apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

const builder = imageUrlBuilder({ projectId, dataset });
export const urlFor = (source: any) => builder.image(source);

export async function sanityFetch<T>({
  query, params = {}, tags = [],
}: { query: string; params?: Record<string, any>; tags?: string[] }): Promise<T> {
  return client.fetch<T>(query, params, {
    next: { revalidate: 60, tags },
    ...(readToken ? { token: readToken } : {}),
  });
}
