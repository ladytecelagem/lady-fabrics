import Link from "next/link";
import { notFound } from "next/navigation";
import { readClient, brandId } from "@/lib/content/client";
import { ArticleEditor } from "@/components/admin/article-editor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit fabric — Admin" };

export default async function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = readClient() as any;
  const bid = await brandId();

  const { data: a } = await sb.from("fabric_articles")
    .select("*").eq("id", id).eq("brand_id", bid ?? "").maybeSingle();
  if (!a) notFound();

  const { data: colours } = await sb.from("fabrics")
    .select("id,code,color_name,thumb_url,swatch_url").eq("article_id", id).order("code");

  const { data: col } = a.collection_id
    ? await sb.from("collections").select("id,name,slug").eq("id", a.collection_id).maybeSingle()
    : { data: null };

  return (
    <div className="p-10">
      <Link href={col ? `/admin/collections/${col.id}` : "/admin/collections"}
        className="text-xs uppercase tracking-widest text-stone hover:underline">
        ← {col?.name ?? "Collections"}
      </Link>
      <h1 className="text-display text-4xl mt-3 mb-8">{a.name}</h1>
      <ArticleEditor initial={a} colours={colours ?? []} collectionSlug={col?.slug ?? null} />
    </div>
  );
}
