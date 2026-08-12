import Link from "next/link";
import { readClient, brandId } from "@/lib/content/client";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { title: "News — Admin" };

export default async function AdminContentNews() {
  const bid = await brandId();
  let items: any[] = [];
  if (bid) {
    const { data } = await readClient().from("news").select("id,title,slug,category,published_at")
      .eq("brand_id", bid).order("published_at", { ascending: false });
    items = data ?? [];
  }

  return (
    <div className="p-10">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-display text-4xl">News</h1>
          <p className="text-stone text-sm mt-2">{items.length} articles</p>
        </div>
        <Button asChild><Link href="/admin/content-news/new">New article</Link></Button>
      </div>

      {items.length === 0 && <p className="text-stone text-sm">No articles yet.</p>}

      {items.length > 0 && (
        <table className="w-full text-sm border-y border-ink/10 max-w-4xl">
          <thead className="text-xs uppercase tracking-widest text-stone">
            <tr><th className="text-left py-3">Title</th><th className="text-left">Category</th><th className="text-left">Date</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(n => (
              <tr key={n.id} className="border-t border-ink/5 hover:bg-bone/50">
                <td className="py-3">{n.title}</td>
                <td className="text-stone">{n.category}</td>
                <td className="text-stone">{n.published_at ? new Date(n.published_at).toLocaleDateString() : ""}</td>
                <td className="text-right"><Link href={`/admin/content-news/${n.id}`} className="text-xs uppercase tracking-widest hover:underline">Edit →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
