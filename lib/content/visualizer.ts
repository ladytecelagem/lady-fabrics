import { readClient, brandId } from "./client";
import type { VisFabric, VisFurniture } from "@/components/visualizer/types";

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch { return fb; }
}

export async function getVisFurniture(): Promise<VisFurniture[]> {
  return safe(async () => {
    const bid = await brandId();
    if (!bid) return [];
    const { data } = await readClient()
      .from("furniture")
      .select("id,name,category,base_image_url,mask_url,shading_url,thumb_url")
      .eq("brand_id", bid)
      .order("name", { ascending: true });
    return (data ?? []).map((f: any) => ({
      id: f.id, name: f.name, category: f.category,
      base: f.base_image_url, mask: f.mask_url, shading: f.shading_url, thumb: f.thumb_url,
    }));
  }, []);
}

export async function getVisFabrics(): Promise<VisFabric[]> {
  return safe(async () => {
    const bid = await brandId();
    if (!bid) return [];
    const { data } = await readClient()
      .from("fabrics")
      .select("id,name,code,swatch_url,texture_url,dominant_colors,in_visualizer,order")
      .eq("brand_id", bid)
      .eq("in_visualizer", true)
      .order("order", { ascending: true });
    return (data ?? [])
      .map((f: any) => ({
        id: f.id, name: f.name, code: f.code,
        swatch: f.texture_url || f.swatch_url,
        dominant_colors: f.dominant_colors,
      }))
      .filter((f: any) => !!f.swatch);
  }, []);
}
