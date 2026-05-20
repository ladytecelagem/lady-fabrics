import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      <SmoothScroll />
      <Navbar />
      <main className="pt-20">{children}</main>
      <Footer />
    </NextIntlClientProvider>
  );
}
