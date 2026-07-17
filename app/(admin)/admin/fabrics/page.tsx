import Link from "next/link";
import { sanityFetch } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Fabrics — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminFabrics() {
  const items = await sanityFetch<any[]>({
    query: groq`*[_type=="fabric"] | order(_updatedAt desc){
      _id, name, slug, code, _updatedAt,
      "collection": collection->title,
      "colorways": count(colorways)
    }`,
  }).catch(() => []);

  return (
    <div className="p-10">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-display text-4xl">Fabrics</h1>
          <p className="text-stone text-sm mt-2">{items.length} total</p>
        </div>
        <div className="flex gap-3">
          <Button asChild><Link href="/admin/fabrics/import">Import from PDF</Link></Button>
          <a href="/studio/structure/fabric;new" target="_blank"
            className="text-xs uppercase tracking-widest self-center hover:underline">New manually ↗</a>
        </div>
      </div>

      {items.length === 0 && (
        <p className="text-stone text-sm">No fabrics yet. Import a color card PDF to start.</p>
      )}

      {items.length > 0 && (
        <table className="w-full text-sm border-y border-ink/10">
          <thead className="text-xs uppercase tracking-widest text-stone">
            <tr>
              <th className="text-left py-3">Name</th>
              <th className="text-left">Collection</th>
              <th className="text-left">Colorways</th>
              <th className="text-left">Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(f => (
              <tr key={f._id} className="border-t border-ink/5 hover:bg-bone/50">
                <td className="py-3">{f.name}{f.code ? ` · ${f.code}` : ""}</td>
                <td>{f.collection}</td>
                <td>{f.colorways ?? 0}</td>
                <td className="text-stone">{new Date(f._updatedAt).toLocaleDateString()}</td>
                <td className="text-right">
                  <a href={`/studio/structure/fabric;${f._id}`} target="_blank"
                    className="text-xs uppercase tracking-widest hover:underline">Edit ↗</a>
                  <Link href={`/fabrics/${f.slug.current}`} target="_blank"
                    className="ml-4 text-xs uppercase tracking-widest hover:underline">View ↗</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
