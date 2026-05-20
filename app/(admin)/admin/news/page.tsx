import { sanityFetch } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { Button } from "@/components/ui/button";

export const metadata = { title: "News — Admin" };

export default async function AdminNews() {
  const items = await sanityFetch<any[]>({
    query: groq`*[_type=="newsItem"] | order(publishedAt desc){ _id, title, category, publishedAt }`,
  }).catch(() => []);
  return (
    <div className="p-10">
      <div className="flex justify-between items-end mb-10">
        <h1 className="text-display text-4xl">News</h1>
        <Button asChild><a href="/studio/structure/newsItem;new" target="_blank">+ New article</a></Button>
      </div>
      <table className="w-full text-sm border-y border-ink/10">
        <thead className="text-xs uppercase tracking-widest text-stone">
          <tr><th className="text-left py-3">Title</th><th>Category</th><th>Published</th><th></th></tr>
        </thead>
        <tbody>
          {items.map(n => (
            <tr key={n._id} className="border-t border-ink/5">
              <td className="py-3">{n.title}</td><td>{n.category}</td>
              <td className="text-stone">{n.publishedAt ? new Date(n.publishedAt).toLocaleDateString() : "—"}</td>
              <td className="text-right"><a href={`/studio/structure/newsItem;${n._id}`} target="_blank" className="text-xs uppercase tracking-widest hover:underline">Edit ↗</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
