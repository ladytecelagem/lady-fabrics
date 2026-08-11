import Link from "next/link";
import { getPage } from "@/lib/content/queries";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export const revalidate = 60;
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://lady-fabrics.vercel.app";

const FB_TITLE = "A contemporary textile house with deep memory.";
const FB_BODY = [
  "Lady Fabrics designs, weaves and finishes textiles for the world's most considered interiors — from architecturally-led workplaces to acoustic environments where material is part of the brief.",
  "We work the way specifiers work: with precision, with patience, and with materials chosen for the lives they will live.",
  "Our practice is contemporary. Our memory — through our origin in Tecelagem Lady — runs decades deep.",
];
const FB_ASIDES = [
  { label: "Heritage", body: "Founded as Tecelagem Lady. Rebuilt for the architectural specification market.", link: "/heritage", linkLabel: "Read the story →" },
  { label: "Practice", body: "Wool, linen, polyester and technical textiles for contract environments." },
];

export async function generateMetadata() {
  const p = await getPage("about");
  return {
    title: p?.seo_title || "About — Lady Fabrics",
    description: p?.seo_description || undefined,
    alternates: { canonical: `${SITE}/about` },
  };
}

export default async function AboutPage() {
  const p = await getPage("about");
  const title = p?.title || FB_TITLE;
  const eyebrow = p?.eyebrow || "— Lady Fabrics";
  const paragraphs = p?.body ? p.body.split("\n\n").filter(Boolean) : FB_BODY;
  const asides = (p?.sections as any)?.asides ?? FB_ASIDES;

  return (
    <>
      <section className="py-32">
        <Container>
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-stone mb-6">{eyebrow}</p>
            <h1 className="text-display text-5xl lg:text-9xl leading-[0.95] max-w-5xl text-balance">{title}</h1>
          </Reveal>
        </Container>
      </section>
      <Container className="pb-32 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8 text-lg text-ink/80 leading-relaxed">
          {paragraphs.map((t: string, i: number) => <p key={i}>{t}</p>)}
        </div>
        <aside className="lg:col-span-4 lg:col-start-9 space-y-6 self-start">
          {asides.map((a: any, i: number) => (
            <div key={i} className="border-l border-ink/20 pl-6">
              <p className="text-xs uppercase tracking-widest text-stone mb-2">{a.label}</p>
              <p className="text-sm">{a.body}</p>
              {a.link && (
                <Button variant="link" className="mt-2 px-0" asChild>
                  <Link href={a.link}>{a.linkLabel || "Read more →"}</Link>
                </Button>
              )}
            </div>
          ))}
        </aside>
      </Container>
    </>
  );
}
