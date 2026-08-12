"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { nav } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "./locale-switcher";

export function Navbar() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    h(); window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header className={cn(
      "fixed inset-x-0 top-0 z-50 transition-all duration-500",
      scrolled ? "glass border-b border-ink/5" : "bg-transparent"
    )}>
      <div className="container-x flex items-center h-20">
        <Link href="/" className="text-display text-2xl tracking-tight mr-16 xl:mr-24">Lady<span className="text-stone">·</span>Fabrics</Link>

        <nav className="hidden lg:flex items-center gap-6">
          {nav.map(item => (
            <Link key={item.href} href={item.href}
              className="text-[11px] uppercase tracking-widest text-ink/70 hover:text-ink transition-colors">
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4 ml-auto">
          <LocaleSwitcher />
          <Button size="sm" asChild><Link href="/contact?intent=sample">{t("requestSample")}</Link></Button>
        </div>

        <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-paper z-50 lg:hidden">
            <div className="container-x h-20 flex items-center justify-between">
              <Link href="/" onClick={() => setOpen(false)} className="text-display text-2xl">Lady·Fabrics</Link>
              <button onClick={() => setOpen(false)} aria-label="Close"><X className="w-6 h-6" /></button>
            </div>
            <nav className="container-x mt-12 flex flex-col gap-6">
              {nav.map(item => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                  className="text-display text-4xl">{t(item.key)}</Link>
              ))}
              <div className="mt-8"><LocaleSwitcher /></div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
