import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="min-h-screen flex flex-col justify-center items-center text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-stone mb-6">— 404</p>
      <h1 className="text-display text-6xl lg:text-9xl mb-8">Off-pattern.</h1>
      <p className="text-stone max-w-md mb-12">This page does not exist. Return to the catalogue or contact us.</p>
      <div className="flex gap-4">
        <Button asChild><Link href="/">Home</Link></Button>
        <Button variant="outline" asChild><Link href="/collections">Collections</Link></Button>
      </div>
    </Container>
  );
}
