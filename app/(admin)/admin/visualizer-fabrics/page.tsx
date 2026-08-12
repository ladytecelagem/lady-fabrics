import { readClient, brandId } from "@/lib/content/client";
import { CurateGrid } from "@/components/admin/curate-grid";

export const dynamic = "force-dynamic";
export const metadata = { title: "Visualizer fabrics — Admin" };

export default async function VisualizerFabricsPage() {
  const sb = readClient();

  // marca de origem (acervo) e destino (lady-fabrics)
  const { data: brands } = await sb.from("brands").select("id,slug").in("slug", ["lady-tecelagem", "lady-fabrics"]);
  const src = (brands ?? []).find((b: any) => b.slug === "lady-tecelagem") as any;
  const dst = (brands ?? []).find((b: any) => b.slug === "lady-fabrics") as any;

  if (!src) {
    return <div className="p-10"><p className="text-stone text-sm">Source brand lady-tecelagem not found.</p></div>;
  }

  // tecidos de origem
  const { data: srcFabrics } = await sb.from("fabrics")
    .select("id,name,code,color_name,thumb_url,swatch_url")
    .eq("brand_id", src.id)
    .order("name", { ascending: true })
    .limit(1000);

  // quais ja estao habilitados (copias em lady-fabrics tem slug 'lt-<sourceId>')
  const enabledSlugs = new Set<string>();
  if (dst) {
    const { data: copies } = await sb.from("fabrics")
      .select("slug").eq("brand_id", dst.id).eq("in_visualizer", true);
    (copies ?? []).forEach((c: any) => enabledSlugs.add(c.slug));
  }

  const rows = (srcFabrics ?? []).map((f: any) => ({
    id: f.id,
    name: f.name,
    code: f.code,
    color_name: f.color_name,
    thumb: f.thumb_url || f.swatch_url,
    enabled: enabledSlugs.has(`lt-${f.id}`),
  }));

  return (
    <div className="p-10">
      <h1 className="text-display text-4xl mb-2">Visualizer fabrics</h1>
      <p className="text-stone text-sm mb-8 max-w-2xl">
        Tap a swatch to add or remove it from the Lady Fabrics visualizer. Enabled fabrics are copied
        into this brand and appear on the public /visualizer page within a minute.
      </p>
      <CurateGrid initial={rows} />
    </div>
  );
}
