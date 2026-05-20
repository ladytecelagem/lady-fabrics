import { Button } from "@/components/ui/button";

export const metadata = { title: "Trends — Admin" };

export default function AdminTrends() {
  return (
    <div className="p-10">
      <div className="flex justify-between items-end mb-10">
        <h1 className="text-display text-4xl">Trends</h1>
        <Button asChild><a href="/studio/structure/trend;new" target="_blank">+ New trend</a></Button>
      </div>
      <p className="text-stone text-sm">Manage seasonal trend content via Sanity Studio.</p>
      <a href="/studio/structure/trend" target="_blank" className="mt-6 inline-block text-xs uppercase tracking-widest underline">Open in Studio ↗</a>
    </div>
  );
}
