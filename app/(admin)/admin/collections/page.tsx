import Link from "next/link";
import { readClient, brandId } from "@/lib/content/client";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Collections — Admin" };

export default async function AdminCollections() {
  const bid = await brandId();
  const { data } = bid
    ? await readClient().from("collections")
        .select("id,name,slug,fiber,order,hero_image_url")
        .eq("brand_id", bid)
        .order("order", { ascending: true })
        .order("name", { ascending: true })
    : { data: [] as any[] };
  const items = (data ?? []) as any[];

  return (
    <div className="p-10">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-display text-4xl">Collections</h1>
          <p className="text-stone text-sm mt-2">{items.length} total · edited here, no Studio</p>
        </div>
        <Button asChild><Link href="/admin/collections/new">+ New collection</Link></Button>
      </div>

      <table className="w-full text-sm border-y border-ink/10">
        <thead className="text-xs uppercase tracking-widest text-stone">
          <tr>
            <th className="text-left py-3 w-16"></th>
            <th className="text-left">Name</th>
            <th className="text-left">Fiber</th>
            <th className="text-left">Order</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map(c => (
            <tr key={c.id} className="border-t border-ink/5 hover:bg-bone/50">
              <td className="py-2">
                <div className="w-12 h-12 border border-ink/10 overflow-hidden bg-bone/40">
                  {c.hero_image_url
                    /* eslint-disable-next-line @next/next/no-img-element */
                    ? <img src={c.hero_image_url} alt="" className="w-full h-full object-cover" />
                    : null}
                </div>
              </td>
              <td>{c.name}</td>
              <td className="text-stone">{c.fiber}</td>
              <td className="text-stone">{c.order}</td>
              <td className="text-right">
                <Link href={`/admin/collections/${c.id}`} className="text-xs uppercase tracking-widest hover:underline">Edit</Link>
                <Link href={`/collections/${c.slug}`} target="_blank" className="ml-4 text-xs uppercase tracking-widest hover:underline">View ↗</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {items.length === 0 && <p className="text-stone text-sm mt-8">No collections yet.</p>}
    </div>
  );
}
