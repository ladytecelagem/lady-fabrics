import Link from "next/link";
import { notFound } from "next/navigation";
import { readClient } from "@/lib/content/client";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export const revalidate = 0;
export const metadata = { title: "Saved selection — Lady Fabrics" };

export default async function BasketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await readClient().from("baskets").select("items,created_at").eq("id", id).maybeSingle();
  if (!data) notFound();

  const items = (data.items as any[]) ?? [];

  return (
    <Container className="py-16 lg:py-24">
      <p className="text-xs uppercase tracking-[0.3em] text-stone mb-4">— Saved selection</p>
      <h1 className="text-display text-4xl lg:text-6xl mb-4">A curated set of combinations</h1>
      <p className="text-stone text-sm mb-12">{items.length} combination{items.length === 1 ? "" : "s"}</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((it, i) => (
          <div key={i} className="border border-ink/10 p-5">
            <p className="text-xs uppercase tracking-widest text-stone mb-1">{it.furnitureName}</p>
            <p className="text-display text-2xl">{it.fabricName}</p>
            {it.fabricCode && <p className="text-sm text-stone">{it.fabricCode}</p>}
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-4">
        <Button asChild>
          <Link href={`/contact?intent=sample&basket=${items.map((i: any) => i.fabricId).join(",")}`}>Request these samples</Link>
        </Button>
        <Button variant="outline" asChild><Link href="/visualizer">Open the visualizer →</Link></Button>
      </div>
    </Container>
  );
}
