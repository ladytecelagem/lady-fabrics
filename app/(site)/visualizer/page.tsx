import { sanityFetch } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { VisualizerShell } from "@/components/visualizer/shell";
import type { FabricVis, FurnitureVis } from "@/components/visualizer/types";

export const revalidate = 60;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://lady-fabrics.vercel.app";

export const metadata = {
  title: "Visualizer — See our textiles on furniture | Lady Fabrics",
  description:
    "Apply Lady Fabrics textiles to furniture in real time. Explore colourways in context and request a sample of the exact combination.",
  alternates: { canonical: `${SITE}/visualizer` },
  openGraph: {
    type: "website", url: `${SITE}/visualizer`, siteName: "Lady Fabrics",
    title: "Visualizer — Lady Fabrics",
    description: "Apply Lady Fabrics textiles to furniture in real time.",
  },
};

const furnitureQuery = groq`*[_type=="furniture" && active == true && !(_id in path("drafts.**"))] | order(order asc){
  "id": _id, name, category, "swatchScale": swatchScale,
  "base": baseImage.asset->url,
  "mask": maskImage.asset->url,
  "shading": shadingImage.asset->url
}`;

const fabricsQuery = groq`*[_type=="fabric" && inVisualizer == true && !(_id in path("drafts.**"))] | order(order asc, name asc){
  "id": _id, name, code,
  "collection": collection->title,
  "category": visualizerCategory,
  "pxPerCm": visualizerPxPerCm,
  "swatch": coalesce(visualizerSwatch.asset->url, mainImage.asset->url)
}`;

export default async function VisualizerPage() {
  const [furniture, fabrics] = await Promise.all([
    sanityFetch<FurnitureVis[]>({ query: furnitureQuery, tags: ["furniture"] }).catch(() => []),
    sanityFetch<FabricVis[]>({ query: fabricsQuery, tags: ["fabric"] }).catch(() => []),
  ]);

  return (
    <Container className="py-16 lg:py-24">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.3em] text-stone mb-4">— Visualizer</p>
        <h1 className="text-display text-5xl lg:text-7xl mb-4">See it in the room</h1>
        <p className="max-w-2xl text-lg text-ink/70 leading-relaxed mb-12">
          Apply our textiles to furniture and read the material in context — weave, colour and light,
          before a single sample ships.
        </p>
      </Reveal>

      {furniture.length === 0 ? (
        <p className="text-stone text-sm">
          No furniture published yet. Add pieces in the Studio (🛋 Furniture) to enable the visualizer.
        </p>
      ) : (
        <VisualizerShell furniture={furniture} fabrics={fabrics} />
      )}
    </Container>
  );
}
