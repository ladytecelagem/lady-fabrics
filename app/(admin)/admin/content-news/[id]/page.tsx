import Link from "next/link";
import { readClient, brandId } from "@/lib/content/client";
import { NewsEditor } from "@/components/admin/news-editor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit article — Admin" };

export default async function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let initial: any = null;
  if (id !== "new") {
    const bid = await brandId();
    if (bid) {
      const { data } = await readClient().from("news").select("*").eq("id", id).eq("brand_id", bid).maybeSingle();
      initial = data;
    }
  }
  return (
    <div className="p-10">
      <Link href="/admin/content-news" className="text-xs uppercase tracking-widest text-stone hover:text-ink">← News</Link>
      <h1 className="text-display text-4xl mt-4 mb-8">{id === "new" ? "New article" : "Edit article"}</h1>
      <NewsEditor initial={initial} />
    </div>
  );
}
