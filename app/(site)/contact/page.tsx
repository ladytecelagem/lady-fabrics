import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/site/contact-form";
import { Suspense } from "react";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <Container className="py-24 grid lg:grid-cols-12 gap-16">
      <div className="lg:col-span-5">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-stone mb-6">— Contact</p>
          <h1 className="text-display text-5xl lg:text-7xl mb-8">Let's specify together.</h1>
          <p className="text-ink/80 mb-12 max-w-md text-pretty">
            Request samples, ask for technical sheets, or start a conversation about your project.
          </p>
          <div className="space-y-6">
            <div><p className="text-xs uppercase tracking-widest text-stone mb-1">Specification & samples</p><p>hello@lady-fabrics.com</p></div>
            <div><p className="text-xs uppercase tracking-widest text-stone mb-1">Dealer enquiries</p><p>dealers@lady-fabrics.com</p></div>
          </div>
        </Reveal>
      </div>
      <div className="lg:col-span-6 lg:col-start-7">
        <Suspense fallback={<div className="h-96 animate-pulse bg-bone" />}>
          <ContactForm />
        </Suspense>
      </div>
    </Container>
  );
}
