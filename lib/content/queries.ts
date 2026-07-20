import { readClient, brandId } from "./client";
import type { Page, Collection, Fabric, Industry, NewsArticle, Furniture } from "./types";

// Small helper: return [] on any error, so a page never crashes on read.
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

// ---------- PAGES ----------
export async function getPage(key: string): Promise<Page | null> {
  return safe(async () => {
    const bid = await brandId();
    if (!bid) return null;
    const { data } = await readClient()
      .from("pages").select("*")
      .eq("brand_id", bid).eq("key", key).single();
    return (data as unknown as Page) ?? null;
  }, null);
}

// ---------- COLLECTIONS ----------
export async function getCollections(): Promise<Collection[]> {
  return safe(async () => {
    const bid = await brandId();
    if (!bid) return [];
    const { data } = await readClient()
      .from("collections").select("*")
      .eq("brand_id", bid)
      .order("order", { ascending: true })
      .order("name", { ascending: true });
    return (data as unknown as Collection[]) ?? [];
  }, []);
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  return safe(async () => {
    const bid = await brandId();
    if (!bid) return null;
    const { data } = await readClient()
      .from("collections").select("*")
      .eq("brand_id", bid).eq("slug", slug).single();
    return (data as unknown as Collection) ?? null;
  }, null);
}

export async function getCollectionSlugs(): Promise<{ slug: string }[]> {
  return safe(async () => {
    const bid = await brandId();
    if (!bid) return [];
    const { data } = await readClient()
      .from("collections").select("slug").eq("brand_id", bid);
    return (data as unknown as { slug: string }[]) ?? [];
  }, []);
}

// ---------- FABRICS ----------
export async function getFabricsByCollection(collectionId: string): Promise<Fabric[]> {
  return safe(async () => {
    const { data } = await readClient()
      .from("fabrics").select("*")
      .eq("collection_id", collectionId)
      .order("order", { ascending: true })
      .order("name", { ascending: true });
    return (data as unknown as Fabric[]) ?? [];
  }, []);
}

export async function getFabricById(id: string): Promise<Fabric | null> {
  return safe(async () => {
    const { data } = await readClient()
      .from("fabrics").select("*").eq("id", id).single();
    return (data as unknown as Fabric) ?? null;
  }, null);
}

export async function getVisualizerFabrics(): Promise<Fabric[]> {
  return safe(async () => {
    const bid = await brandId();
    if (!bid) return [];
    const { data } = await readClient()
      .from("fabrics").select("*")
      .eq("brand_id", bid).eq("in_visualizer", true)
      .order("order", { ascending: true });
    return (data as unknown as Fabric[]) ?? [];
  }, []);
}

// ---------- INDUSTRIES ----------
export async function getIndustries(): Promise<Industry[]> {
  return safe(async () => {
    const bid = await brandId();
    if (!bid) return [];
    const { data } = await readClient()
      .from("industries").select("*")
      .eq("brand_id", bid).order("order", { ascending: true });
    return (data as unknown as Industry[]) ?? [];
  }, []);
}

export async function getIndustryBySlug(slug: string): Promise<Industry | null> {
  return safe(async () => {
    const bid = await brandId();
    if (!bid) return null;
    const { data } = await readClient()
      .from("industries").select("*")
      .eq("brand_id", bid).eq("slug", slug).single();
    return (data as unknown as Industry) ?? null;
  }, null);
}

// ---------- NEWS ----------
export async function getNews(limit = 50): Promise<NewsArticle[]> {
  return safe(async () => {
    const bid = await brandId();
    if (!bid) return [];
    const { data } = await readClient()
      .from("news").select("*")
      .eq("brand_id", bid)
      .order("published_at", { ascending: false })
      .limit(limit);
    return (data as unknown as NewsArticle[]) ?? [];
  }, []);
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  return safe(async () => {
    const bid = await brandId();
    if (!bid) return null;
    const { data } = await readClient()
      .from("news").select("*")
      .eq("brand_id", bid).eq("slug", slug).single();
    return (data as unknown as NewsArticle) ?? null;
  }, null);
}

// ---------- FURNITURE (visualizer) ----------
export async function getFurniture(): Promise<Furniture[]> {
  return safe(async () => {
    const bid = await brandId();
    if (!bid) return [];
    const { data } = await readClient()
      .from("furniture").select("*")
      .eq("brand_id", bid).order("name", { ascending: true });
    return (data as unknown as Furniture[]) ?? [];
  }, []);
}
