import Link from "next/link";
import { notFound } from "next/navigation";
import { readClient, brandId } from "@/lib/content/client";
import { CollectionEditor } from "@/components/admin/collection-editor";
import { CollectionFabrics } from "@/components/admin/collection-fabrics";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit collection — Admin" };

export default async function EditCollection({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const sb = readClient() as any;
  const bid = await brandId();

  let row: any = null;
  if (!isNew) {
    const { data } = await sb.from("collections")
      .select("*").eq("id", id).eq("brand_id", bid ?? "").maybeSingle();
    if (!data) notFound();
    row = data;
  }

  let articles: any[] = [];
  if (!isNew) {
    const { data: arts } = await sb.from("fabric_articles")
      .select("id,name,hero_image_url").eq("collection_id", id)
      .order("order", { ascending: true }).order("name", { ascending: true });
    const { data: mine } = await sb.from("fabrics")
      .select("article_id,thumb_url,swatch_url").eq("collection_id", id);
    articles = (arts ?? []).map((a: any) => {
      const cs = (mine ?? []).filter((f: any) => f.article_id === a.id);
      return { ...a, colours: cs.length, cover: cs[0]?.thumb_url || cs[0]?.swatch_url || null };
    });
  }

  let picker: any[] = [];
  if (!isNew) {
    const { data: brands } = await sb.from("brands").select("id,slug").eq("slug", "lady-tecelagem");
    const src = (brands ?? [])[0];
    if (src) {
      const { data: srcFabrics } = await sb.from("fabrics")
        .select("id,name,code,color_name,thumb_url,swatch_url")
        .eq("brand_id", src.id).order("name", { ascending: true }).limit(2000);

      const { data: copies } = await sb.from("fabrics")
        .select("slug,collection_id").eq("brand_id", bid ?? "");
      const { data: cols } = await sb.from("collections").select("id,name").eq("brand_id", bid ?? "");
      const colName = new Map<string, string>((cols ?? []).map((c: any) => [c.id, c.name]));
      const bySlug = new Map<string, string | null>((copies ?? []).map((c: any) => [c.slug, c.collection_id]));

      picker = (srcFabrics ?? []).map((f: any) => {
        const cid = bySlug.get(`lt-${f.id}`) ?? null;
        return {
          id: f.id, name: f.name, code: f.code, color_name: f.color_name,
          thumb: f.thumb_url || f.swatch_url,
          assigned: cid === id,
          otherCollection: cid && cid !== id ? (colName.get(cid) ?? null) : null,
        };
      });
    }
  }

  return (
    <div className="p-10">
      <Link href="/admin/collections" className="text-xs uppercase tracking-widest text-stone hover:underline">← Collections</Link>
      <h1 className="text-display text-4xl mt-3 mb-8">{isNew ? "New collection" : row.name}</h1>

      <CollectionEditor initial={row} />

      {!isNew && articles.length > 0 && (
        <div className="mt-16 border-t border-ink/10 pt-10">
          <h2 className="text-display text-3xl mb-2">Fabric articles</h2>
          <p className="text-stone text-sm mb-6 max-w-2xl">
            Cada artigo vira uma página própria. Clique para editar imagem de capa, ficha técnica e descrição.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {articles.map((a: any) => (
              <Link key={a.id} href={`/admin/articles/${a.id}`} className="group block">
                <div className="aspect-[4/5] border border-ink/10 overflow-hidden bg-bone/40">
                  {(a.hero_image_url || a.cover)
                    /* eslint-disable-next-line @next/next/no-img-element */
                    ? <img src={a.hero_image_url || a.cover} alt="" className="w-full h-full object-cover" />
                    : null}
                </div>
                <p className="text-sm mt-2 group-hover:underline">{a.name}</p>
                <p className="text-[11px] uppercase tracking-widest text-stone">{a.colours} colours</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!isNew && (
        <div className="mt-16 border-t border-ink/10 pt-10">
          <h2 className="text-display text-3xl mb-2">Fabrics in this collection</h2>
          <p className="text-stone text-sm mb-6 max-w-2xl">
            Same catalogue used by the visualizer. Tap a colour to add or remove it from this collection.
            A fabric can be in a collection, in the visualizer, or both. “•” marks colours already used in another collection.
          </p>
          <CollectionFabrics collectionId={id} initial={picker} />
        </div>
      )}
    </div>
  );
}
