import Image from "next/image";
import { getIndustries } from "@/lib/content/queries";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";

export const revalidate = 60;
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://lady-fabrics.vercel.app";

export async function generateMetadata() {
  return {
    title: "Industries — Lady Fabrics",
    description: "Specification markets we serve: workplace, hospitality, residential, acoustic, furniture and contract interiors.",
    alternates: { canonical: `${SITE}/industries` },
    openGraph: {
      type: "website", url: `${SITE}/industries`, siteName: "Lady Fabrics",
      title: "Industries — Lady Fabrics",
      description: "Textiles specified for workplace, hospitality, residential, acoustic, furniture and contract environments.",
    },
  };
}

export default async function IndustriesPage() {
  const items = await getIndustries();

  return (
    <Container className="py-24">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.3em] text-stone mb-6">— Specification markets</p>
        <h1 className="text-display text-5xl lg:text-8xl mb-16">Industries</h1>
      </Reveal>

      {items.length === 0 && (
        <p className="text-stone text-sm">Industries will appear here once published.</p>
      )}

      <div className="space-y-32">
        {items.map((ind, i) => (
          <section key={ind.id} id={ind.slug} className="grid lg:grid-cols-12 gap-12 scroll-mt-24">
            <div className={`lg:col-span-7 ${i % 2 ? "lg:col-start-6 lg:order-2" : ""}`}>
              <div className="relative aspect-[4/3] bg-wool overflow-hidden">
                {ind.image_url && <Image src={ind.image_url} alt={ind.name} fill className="object-cover" />}
              </div>
            </div>
            <div className={`lg:col-span-4 self-center ${i % 2 ? "lg:col-start-2 lg:order-1" : ""}`}>
              <p className="text-xs uppercase tracking-widest text-stone mb-4">— {String(i + 1).padStart(2, "0")}</p>
              <h2 className="text-display text-4xl lg:text-6xl mb-6">{ind.name}</h2>
              {ind.description && <p className="text-ink/80 text-pretty">{ind.description}</p>}
            </div>
          </section>
        ))}
      </div>
    </Container>
  );
}
