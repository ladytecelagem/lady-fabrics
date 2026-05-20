import { createClient } from "@/lib/supabase/server";
import { sanityFetch } from "@/sanity/lib/client";
import { groq } from "next-sanity";

async function getStats() {
  const sb = await createClient();
  const [requests, contacts, dealers, subs, jobs] = await Promise.all([
    sb.from("sample_requests").select("id, status, created_at").order("created_at", { ascending: false }).limit(50),
    sb.from("contact_messages").select("id, handled", { count: "exact", head: true }),
    sb.from("dealer_requests").select("id, status", { count: "exact", head: true }),
    sb.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
    sb.from("sample_book_jobs").select("id, status").order("created_at", { ascending: false }).limit(10),
  ]);
  const sanityCounts = await sanityFetch<any>({
    query: groq`{
      "collections": count(*[_type=="collection"]),
      "sampleBooks": count(*[_type=="sampleBook"]),
      "news": count(*[_type=="newsItem"]),
    }`,
  }).catch(() => ({ collections: 0, sampleBooks: 0, news: 0 }));

  return { requests: requests.data || [], contacts, dealers, subs, jobs: jobs.data || [], sanityCounts };
}

export default async function AdminDashboard() {
  const s = await getStats();
  const newRequests = s.requests.filter(r => r.status === "new").length;

  return (
    <div className="p-10">
      <h1 className="text-display text-5xl mb-2">Dashboard</h1>
      <p className="text-stone text-sm mb-12">Operational view of Lady Fabrics platform.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink/10 border border-ink/10 mb-12">
        <Card label="New sample requests" value={newRequests} />
        <Card label="Newsletter subscribers" value={s.subs.count ?? 0} />
        <Card label="Contact messages" value={s.contacts.count ?? 0} />
        <Card label="Dealer requests" value={s.dealers.count ?? 0} />
        <Card label="Collections" value={s.sanityCounts.collections} />
        <Card label="Sample books" value={s.sanityCounts.sampleBooks} />
        <Card label="News articles" value={s.sanityCounts.news} />
        <Card label="PDF jobs (recent)" value={s.jobs.length} />
      </div>

      <section className="mb-12">
        <h2 className="text-display text-2xl mb-6">Recent sample requests</h2>
        <table className="w-full text-sm border-y border-ink/10">
          <thead className="text-xs uppercase tracking-widest text-stone">
            <tr><th className="text-left py-3">When</th><th className="text-left">Status</th><th className="text-left">ID</th></tr>
          </thead>
          <tbody>
            {s.requests.slice(0, 10).map(r => (
              <tr key={r.id} className="border-t border-ink/5">
                <td className="py-3">{new Date(r.created_at).toLocaleString()}</td>
                <td><span className="text-xs uppercase tracking-widest">{r.status}</span></td>
                <td className="font-mono text-xs">{r.id.slice(0, 8)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-paper p-8">
      <p className="text-xs uppercase tracking-widest text-stone mb-3">{label}</p>
      <p className="text-display text-4xl">{value}</p>
    </div>
  );
}
