import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";

export const metadata = { title: "Sustainability" };

const pillars = [
  { n: "01", t: "Material origin", d: "Wool from certified pastoral systems. Linen grown on rainfed European fields. Polyester from post-consumer streams." },
  { n: "02", t: "Process honesty", d: "Water-cautious dyeing, OEKO-TEX certified finishes, no PFAS, no halogenated flame retardants." },
  { n: "03", t: "End of life", d: "Designed to return: compostable wool blends, mono-material constructions, take-back partnerships." },
  { n: "04", t: "Transparency", d: "Every collection ships with a material passport. EPDs available on request." },
];

export default function SustainabilityPage() {
  return (
    <>
      <section className="bg-moss text-bone py-32">
        <Container>
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-bone/60 mb-6">— Commitment</p>
            <h1 className="text-display text-5xl lg:text-9xl leading-[0.95] max-w-5xl">Materials that return.</h1>
            <p className="mt-12 max-w-xl text-lg text-bone/80">We measure progress in cycles, not seasons.</p>
          </Reveal>
        </Container>
      </section>
      <Container className="py-24">
        <div className="grid md:grid-cols-2 gap-16">
          {pillars.map(p => (
            <div key={p.n}>
              <p className="text-xs uppercase tracking-widest text-stone mb-4">{p.n}</p>
              <h2 className="text-display text-3xl mb-4">{p.t}</h2>
              <p className="text-ink/80 text-pretty">{p.d}</p>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
