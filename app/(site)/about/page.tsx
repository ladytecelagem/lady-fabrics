import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <section className="py-32">
        <Container>
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-stone mb-6">— Lady Fabrics</p>
            <h1 className="text-display text-5xl lg:text-9xl leading-[0.95] max-w-5xl text-balance">
              A contemporary textile house with deep memory.
            </h1>
          </Reveal>
        </Container>
      </section>
      <Container className="pb-32 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8 text-lg text-ink/80 leading-relaxed">
          <p>Lady Fabrics designs, weaves and finishes textiles for the world's most considered interiors — from architecturally-led workplaces to acoustic environments where material is part of the brief.</p>
          <p>We work the way specifiers work: with precision, with patience, and with materials chosen for the lives they will live.</p>
          <p>Our practice is contemporary. Our memory — through our origin in Tecelagem Lady — runs decades deep.</p>
        </div>
        <aside className="lg:col-span-4 lg:col-start-9 space-y-6 self-start">
          <div className="border-l border-ink/20 pl-6">
            <p className="text-xs uppercase tracking-widest text-stone mb-2">Heritage</p>
            <p className="text-sm">Founded as Tecelagem Lady. Rebuilt for the architectural specification market.</p>
            <Button variant="link" className="mt-2 px-0" asChild><Link href="/heritage">Read the story →</Link></Button>
          </div>
          <div className="border-l border-ink/20 pl-6">
            <p className="text-xs uppercase tracking-widest text-stone mb-2">Practice</p>
            <p className="text-sm">Wool, linen, polyester and technical textiles for contract environments.</p>
          </div>
        </aside>
      </Container>
    </>
  );
}
