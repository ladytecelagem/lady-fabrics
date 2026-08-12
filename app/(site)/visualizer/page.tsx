import { getVisFurniture, getVisFabrics } from "@/lib/content/visualizer";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { VisualizerShell } from "@/components/visualizer/shell";

export const revalidate = 60;
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://lady-fabrics.vercel.app";

export const metadata = {
  title: "Visualizer — See our textiles on furniture | Lady Fabrics",
  description: "Apply Lady Fabrics textiles to furniture in real time. Explore fabrics in context and request a sample of the exact combination.",
  alternates: { canonical: `${SITE}/visualizer` },
  openGraph: { type: "website", url: `${SITE}/visualizer`, siteName: "Lady Fabrics",
    title: "Visualizer — Lady Fabrics", description: "Apply Lady Fabrics textiles to furniture in real time." },
};

export default async function VisualizerPage() {
  const [furniture, fabrics] = await Promise.all([getVisFurniture(), getVisFabrics()]);

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
        <div className="border border-ink/10 p-8">
          <p className="text-stone text-sm">
            No furniture is available for Lady Fabrics yet. Add pieces (with an upholstery mask) to the
            <span className="font-mono"> furniture </span> table under this brand to enable the visualizer.
          </p>
        </div>
      ) : (
        <VisualizerShell furniture={furniture} fabrics={fabrics} />
      )}
    </Container>
  );
}
