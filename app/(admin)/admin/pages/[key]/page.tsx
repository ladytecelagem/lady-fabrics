import Link from "next/link";
import { readClient, brandId } from "@/lib/content/client";
import { PageEditor } from "@/components/admin/page-editor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit page — Admin" };

export default async function EditPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const bid = await brandId();
  let initial: any = null;
  if (bid) {
    const { data } = await readClient().from("pages").select("*").eq("brand_id", bid).eq("key", key).maybeSingle();
    initial = data;
  }

  return (
    <div className="p-10">
      <Link href="/admin/pages" className="text-xs uppercase tracking-widest text-stone hover:text-ink">← Pages</Link>
      <h1 className="text-display text-4xl mt-4 mb-8 capitalize">{key}</h1>
      <PageEditor pageKey={key} initial={initial} />
    </div>
  );
}
