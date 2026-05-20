import { notFound } from "next/navigation";
import Link from "next/link";
import { sanityFetch } from "@/sanity/lib/client";
import { sampleBookBySlugQuery } from "@/sanity/lib/queries";
import { SampleBookViewer } from "@/components/sample-book/viewer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = await sanityFetch<any>({ query: sampleBookBySlugQuery, params: { slug } }).catch(() => null);
  return { title: b?.title || "Sample Book" };
}

export default async function SampleBookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await sanityFetch<any>({ query: sampleBookBySlugQuery, params: { slug }, tags: [`sampleBook:${slug}`] }).catch(() => null);
  if (!book) notFound();

  return (
    <div className="bg-ink text-bone min-h-screen">
      <Container className="pt-12 pb-6 flex justify-between items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-bone/60">Cartela</p>
          <h1 className="text-display text-3xl lg:text-5xl mt-2">{book.title}</h1>
        </div>
        <div className="flex gap-3">
          {book.pdfUrl && (
            <Button variant="outline" className="border-bone text-bone hover:bg-bone hover:text-ink" asChild>
              <a href={book.pdfUrl} download>Download PDF</a>
            </Button>
          )}
          <Button variant="bone" asChild>
            <Link href={`/contact?intent=sample&book=${book.slug.current}`}>Request samples</Link>
          </Button>
        </div>
      </Container>

      <SampleBookViewer pages={book.pages || []} />
    </div>
  );
}
