import Link from "next/link";
import { sanityFetch } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Collections — Admin" };

export default async function AdminCollections() {
  const items = await sanityFetch<any[]>({
    query: groq`*[_type=="collection"] | order(_updatedAt desc){ _id, title, slug, fiber, _updatedAt }`,
  }).catch(() => []);

  return (
    <div className="p-10">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-display text-4xl">Collections</h1>
          <p className="text-stone text-sm mt-2">{items.length} total</p>
        </div>
        <Button asChild><a href="/studio/structure/collection;new" target="_blank">+ New collection</a></Button>
      </div>

      <table className="w-full text-sm border-y border-ink/10">
        <thead className="text-xs uppercase tracking-widest text-stone">
          <tr><th className="text-left py-3">Title</th><th className="text-left">Fiber</th><th className="text-left">Updated</th><th></th></tr>
        </thead>
        <tbody>
          {items.map(c => (
            <tr key={c._id} className="border-t border-ink/5 hover:bg-bone/50">
              <td className="py-3">{c.title}</td>
              <td>{c.fiber}</td>
              <td className="text-stone">{new Date(c._updatedAt).toLocaleDateString()}</td>
              <td className="text-right">
                <a href={`/studio/structure/collection;${c._id}`} target="_blank" className="text-xs uppercase tracking-widest hover:underline">Edit ↗</a>
                <Link href={`/collections/${c.slug.current}`} target="_blank" className="ml-4 text-xs uppercase tracking-widest hover:underline">View ↗</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
