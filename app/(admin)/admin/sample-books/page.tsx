import { sanityFetch } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { SampleBookUpload } from "@/components/admin/sample-book-upload";

export const metadata = { title: "Sample Books — Admin" };

export default async function AdminSampleBooks() {
  const sb = await createClient();
  const [books, jobs] = await Promise.all([
    sanityFetch<any[]>({
      query: groq`*[_type=="sampleBook"] | order(_updatedAt desc){ _id, title, slug, pageCount, parsingStatus, _updatedAt }`,
    }).catch(() => []),
    sb.from("sample_book_jobs").select("*").order("created_at", { ascending: false }).limit(10),
  ]);

  return (
    <div className="p-10 space-y-12">
      <div>
        <h1 className="text-display text-4xl">Sample Books</h1>
        <p className="text-stone text-sm mt-2">Upload PDF cartelas — pages are extracted, indexed and made browsable.</p>
      </div>

      <section>
        <h2 className="text-display text-2xl mb-6">Upload new cartela</h2>
        <SampleBookUpload />
      </section>

      <section>
        <h2 className="text-display text-2xl mb-6">Recent parsing jobs</h2>
        <table className="w-full text-sm border-y border-ink/10">
          <thead className="text-xs uppercase tracking-widest text-stone">
            <tr><th className="text-left py-3">File</th><th>Status</th><th>Pages</th><th>When</th></tr>
          </thead>
          <tbody>
            {(jobs.data || []).map(j => (
              <tr key={j.id} className="border-t border-ink/5">
                <td className="py-3">{j.filename}</td>
                <td className="text-xs uppercase tracking-widest">{j.status}</td>
                <td>{j.page_count ?? "—"}</td>
                <td className="text-stone">{new Date(j.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-display text-2xl">Published sample books</h2>
          <Button asChild><a href="/studio/structure/sampleBook;new" target="_blank">+ New in Studio</a></Button>
        </div>
        <table className="w-full text-sm border-y border-ink/10">
          <thead className="text-xs uppercase tracking-widest text-stone">
            <tr><th className="text-left py-3">Title</th><th>Pages</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {books.map(b => (
              <tr key={b._id} className="border-t border-ink/5">
                <td className="py-3">{b.title}</td>
                <td>{b.pageCount ?? "—"}</td>
                <td className="text-xs uppercase tracking-widest">{b.parsingStatus || "—"}</td>
                <td className="text-right">
                  <a href={`/studio/structure/sampleBook;${b._id}`} target="_blank" className="text-xs uppercase tracking-widest hover:underline">Edit ↗</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
