import { getPage } from "@/lib/content/queries";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";

export const revalidate = 60;
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://lady-fabrics.vercel.app";

const FB_TITLE = "From a loom to a language.";
const FB_TIMELINE = [
  { y: "—", t: "Tecelagem Lady", d: "The original mill: weaving expertise built across generations." },
  { y: "—", t: "A textile practice", d: "Decades of refinement in fibre, finish and behaviour." },
  { y: "Now", t: "Lady Fabrics", d: "A contemporary brand for architectural specification, born of that craft." },
];

export async function generateMetadata() {
  const p = await getPage("heritage");
  return {
    title: p?.seo_title || "Heritage — Lady Fabrics",
    description: p?.seo_description || undefined,
    alternates: { canonical: `${SITE}/heritage` },
  };
}

export default async function HeritagePage() {
  const p = await getPage("heritage");
  const title = p?.title || FB_TITLE;
  const eyebrow = p?.eyebrow || "— Heritage";
  const timeline = (p?.sections as any)?.timeline ?? FB_TIMELINE;

  return (
    <Container className="py-24">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.3em] text-stone mb-6">{eyebrow}</p>
        <h1 className="text-display text-5xl lg:text-9xl leading-[0.95] mb-20 max-w-4xl">{title}</h1>
      </Reveal>
      <div className="border-t border-ink/10">
        {timeline.map((item: any, i: number) => (
          <div key={i} className="border-b border-ink/10 grid lg:grid-cols-12 gap-8 py-12">
            <p className="lg:col-span-2 text-xs uppercase tracking-widest text-stone">{item.y}</p>
            <h2 className="lg:col-span-4 text-display text-3xl">{item.t}</h2>
            <p className="lg:col-span-5 lg:col-start-8 text-ink/80 text-pretty">{item.d}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}
