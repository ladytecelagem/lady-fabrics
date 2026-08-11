import { getPage } from "@/lib/content/queries";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";

export const revalidate = 60;
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://lady-fabrics.vercel.app";

const FB_TITLE = "Materials that return.";
const FB_SUB = "We measure progress in cycles, not seasons.";
const FB_PILLARS = [
  { n: "01", t: "Material origin", d: "Wool from certified pastoral systems. Linen grown on rainfed European fields. Polyester from post-consumer streams." },
  { n: "02", t: "Process honesty", d: "Water-cautious dyeing, OEKO-TEX certified finishes, no PFAS, no halogenated flame retardants." },
  { n: "03", t: "End of life", d: "Designed to return: compostable wool blends, mono-material constructions, take-back partnerships." },
  { n: "04", t: "Transparency", d: "Every collection ships with a material passport. EPDs available on request." },
];

export async function generateMetadata() {
  const p = await getPage("sustainability");
  return {
    title: p?.seo_title || "Sustainability — Lady Fabrics",
    description: p?.seo_description || undefined,
    alternates: { canonical: `${SITE}/sustainability` },
  };
}

export default async function SustainabilityPage() {
  const p = await getPage("sustainability");
  const title = p?.title || FB_TITLE;
  const subtitle = p?.subtitle || FB_SUB;
  const eyebrow = p?.eyebrow || "— Commitment";
  const pillars = (p?.sections as any)?.pillars ?? FB_PILLARS;

  return (
    <>
      <section className="bg-moss text-bone py-32">
        <Container>
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-bone/60 mb-6">{eyebrow}</p>
            <h1 className="text-display text-5xl lg:text-9xl leading-[0.95] max-w-5xl">{title}</h1>
            {subtitle && <p className="mt-12 max-w-xl text-lg text-bone/80">{subtitle}</p>}
          </Reveal>
        </Container>
      </section>
      <Container className="py-24">
        <div className="grid md:grid-cols-2 gap-16">
          {pillars.map((pil: any) => (
            <div key={pil.n}>
              <p className="text-xs uppercase tracking-widest text-stone mb-4">{pil.n}</p>
              <h2 className="text-display text-3xl mb-4">{pil.t}</h2>
              <p className="text-ink/80 text-pretty">{pil.d}</p>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
