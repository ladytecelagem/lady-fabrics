"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { nav } from "@/lib/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"ok"|"err">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const r = await fetch("/api/newsletter", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(r.ok ? "ok" : "err");
      if (r.ok) setEmail("");
    } catch { setStatus("err"); }
  };

  return (
    <footer className="mt-32 border-t border-ink/10 bg-bone">
      <div className="container-x py-20 grid lg:grid-cols-4 gap-12">
        <div className="lg:col-span-2">
          <div className="text-display text-3xl mb-6">Lady<span className="text-stone">·</span>Fabrics</div>
          <p className="text-sm text-stone max-w-md mb-8">Architectural textile intelligence for the world's most considered interiors.</p>
          <form onSubmit={submit} className="max-w-md">
            <p className="text-xs uppercase tracking-widest mb-2">{t("footer.newsletter")}</p>
            <p className="text-xs text-stone mb-4">{t("footer.newsletterDesc")}</p>
            <div className="flex gap-3">
              <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder={t("form.email")} />
              <Button type="submit" size="sm" disabled={status === "loading"}>→</Button>
            </div>
            {status === "ok" && <p className="text-xs mt-3 text-moss">{t("form.success")}</p>}
            {status === "err" && <p className="text-xs mt-3 text-red-700">{t("form.error")}</p>}
          </form>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest mb-4">Navigate</p>
          <ul className="space-y-2 text-sm">
            {nav.map(n => <li key={n.href}><Link href={n.href} className="text-stone hover:text-ink transition-colors">{t(`nav.${n.key}`)}</Link></li>)}
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest mb-4">Contact</p>
          <p className="text-sm text-stone">hello@lady-fabrics.com</p>
        </div>
      </div>

      <div className="container-x py-6 border-t border-ink/10 flex justify-between text-xs text-stone">
        <span>© {new Date().getFullYear()} Lady Fabrics Corp. {t("footer.rights")}</span>
        <span>Made with care.</span>
      </div>
    </footer>
  );
}
