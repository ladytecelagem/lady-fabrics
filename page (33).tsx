import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";

export const metadata = { title: "Heritage" };

const timeline = [
  { y: "—", t: "Tecelagem Lady", d: "The original mill: weaving expertise built across generations." },
  { y: "—", t: "A textile practice", d: "Decades of refinement in fibre, finish and behaviour." },
  { y: "Now", t: "Lady Fabrics", d: "A contemporary brand for architectural specification, born of that craft." },
];

export default function HeritagePage() {
  return (
    <Container className="py-24">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.3em] text-stone mb-6">— Heritage</p>
        <h1 className="text-display text-5xl lg:text-9xl leading-[0.95] mb-20 max-w-4xl">From a loom to a language.</h1>
      </Reveal>
      <div className="border-t border-ink/10">
        {timeline.map(item => (
          <div key={item.t} className="border-b border-ink/10 grid lg:grid-cols-12 gap-8 py-12">
            <p className="lg:col-span-2 text-xs uppercase tracking-widest text-stone">{item.y}</p>
            <h2 className="lg:col-span-4 text-display text-3xl">{item.t}</h2>
            <p className="lg:col-span-5 lg:col-start-8 text-ink/80 text-pretty">{item.d}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}
