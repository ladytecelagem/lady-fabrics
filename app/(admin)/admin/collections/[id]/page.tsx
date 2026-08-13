import Link from "next/link";
import { notFound } from "next/navigation";
import { readClient, brandId } from "@/lib/content/client";
import { CollectionEditor } from "@/components/admin/collection-editor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit collection — Admin" };

export default async function EditCollection({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";

  let row: any = null;
  if (!isNew) {
    const bid = await brandId();
    const { data } = await readClient().from("collections")
      .select("*").eq("id", id).eq("brand_id", bid ?? "").maybeSingle();
    if (!data) notFound();
    row = data;
  }

  return (
    <div className="p-10">
      <Link href="/admin/collections" className="text-xs uppercase tracking-widest text-stone hover:underline">← Collections</Link>
      <h1 className="text-display text-4xl mt-3 mb-8">{isNew ? "New collection" : row.name}</h1>
      <CollectionEditor initial={row} />
    </div>
  );
}
