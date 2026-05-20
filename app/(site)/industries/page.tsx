import Image from "next/image";
import { sanityFetch } from "@/sanity/lib/client";
import { allIndustriesQuery } from "@/sanity/lib/queries";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";

export const revalidate = 60;
export async function generateMetadata() { return { title: "Industries" }; }

export default async function IndustriesPage() {
  const items = await sanityFetch<any[]>({ query: allIndustriesQuery, tags: ["industry"] }).catch(() => []);
  return (
    <Container className="py-24">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.3em] text-stone mb-6">— Specification markets</p>
        <h1 className="text-display text-5xl lg:text-8xl mb-16">Industries</h1>
      </Reveal>
      <div className="space-y-32">
        {items?.map((ind: any, i: number) => (
          <section key={ind._id} id={ind.slug?.current} className="grid lg:grid-cols-12 gap-12">
            <div className={`lg:col-span-7 ${i % 2 ? "lg:col-start-6 lg:order-2" : ""}`}>
              <div className="relative aspect-[4/3] bg-wool overflow-hidden">
                {ind.image && <Image src={ind.image} alt={ind.name} fill className="object-cover" />}
              </div>
            </div>
            <div className={`lg:col-span-4 self-center ${i % 2 ? "lg:col-start-2 lg:order-1" : ""}`}>
              <p className="text-xs uppercase tracking-widest text-stone mb-4">— {String(i + 1).padStart(2, "0")}</p>
              <h2 className="text-display text-4xl lg:text-6xl mb-6">{ind.name}</h2>
              <p className="text-ink/80 text-pretty">{ind.description?.en || ind.description}</p>
            </div>
          </section>
        ))}
      </div>
    </Container>
  );
}
