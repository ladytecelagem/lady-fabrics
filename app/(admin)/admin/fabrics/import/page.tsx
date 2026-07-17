import { sanityFetch } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { FabricImporter } from "@/components/admin/fabric-importer";

export const metadata = { title: "Import fabric — Admin" };
export const dynamic = "force-dynamic";

export default async function ImportFabricPage() {
  const collections = await sanityFetch<any[]>({
    query: groq`*[_type=="collection" && !(_id in path("drafts.**"))] | order(order asc){ _id, title }`,
  }).catch(() => []);

  return (
    <div className="p-10 max-w-5xl">
      <h1 className="text-display text-4xl">Import fabric</h1>
      <p className="text-stone text-sm mt-2 mb-10">
        Upload a color card PDF. Specs and colorways are extracted automatically — review, then create.
      </p>
      <FabricImporter collections={collections} />
    </div>
  );
}
