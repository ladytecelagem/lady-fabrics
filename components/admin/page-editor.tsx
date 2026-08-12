"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PageRow = {
  id?: string;
  key: string;
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  hero_image_url?: string | null;
  sections?: any;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image_url?: string | null;
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-xs uppercase tracking-widest text-stone">{label}</span>
    <div className="mt-1">{children}</div>
  </label>
);

export function PageEditor({ pageKey, initial }: { pageKey: string; initial: PageRow | null }) {
  const router = useRouter();
  const [v, setV] = useState<PageRow>(initial ?? { key: pageKey });
  const [sectionsText, setSectionsText] = useState(
    initial?.sections ? JSON.stringify(initial.sections, null, 2) : "{}"
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const upd = (k: keyof PageRow, val: any) => setV(s => ({ ...s, [k]: val }));

  const save = async () => {
    setBusy(true); setErr(""); setMsg("");
    let sections: any = undefined;
    if (sectionsText.trim()) {
      try { sections = JSON.parse(sectionsText); }
      catch { setErr("Sections: JSON inválido"); setBusy(false); return; }
    }
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert-page", table: "pages", key: pageKey,
          values: {
            eyebrow: v.eyebrow, title: v.title, subtitle: v.subtitle, body: v.body,
            hero_image_url: v.hero_image_url, sections,
            seo_title: v.seo_title, seo_description: v.seo_description, og_image_url: v.og_image_url,
          },
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "save failed");
      setMsg("Saved. Changes appear on the site within a minute.");
      router.refresh();
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div className="grid gap-6">
        <Field label="Eyebrow"><Input value={v.eyebrow ?? ""} onChange={e => upd("eyebrow", e.target.value)} /></Field>
        <Field label="Title">
          <textarea rows={2} value={v.title ?? ""} onChange={e => upd("title", e.target.value)}
            className="w-full border border-ink/20 bg-transparent p-3 text-sm focus:outline-none focus:border-ink" />
        </Field>
        <Field label="Subtitle"><Input value={v.subtitle ?? ""} onChange={e => upd("subtitle", e.target.value)} /></Field>
        <Field label="Body (parágrafos separados por linha em branco)">
          <textarea rows={8} value={v.body ?? ""} onChange={e => upd("body", e.target.value)}
            className="w-full border border-ink/20 bg-transparent p-3 text-sm font-mono focus:outline-none focus:border-ink" />
        </Field>
        <Field label="Hero image URL"><Input value={v.hero_image_url ?? ""} onChange={e => upd("hero_image_url", e.target.value)} placeholder="https://…" /></Field>

        <details className="border border-ink/10 p-4">
          <summary className="text-xs uppercase tracking-widest text-stone cursor-pointer">Sections (JSON avançado)</summary>
          <textarea rows={10} value={sectionsText} onChange={e => setSectionsText(e.target.value)}
            className="w-full border border-ink/20 bg-transparent p-3 text-xs font-mono mt-4 focus:outline-none focus:border-ink" />
          <p className="text-xs text-stone mt-2">Estrutura específica da página (pilares, timeline, asides…). Edite com cuidado.</p>
        </details>

        <div className="grid md:grid-cols-2 gap-6 border-t border-ink/10 pt-6">
          <Field label="SEO title"><Input value={v.seo_title ?? ""} onChange={e => upd("seo_title", e.target.value)} /></Field>
          <Field label="OG image URL"><Input value={v.og_image_url ?? ""} onChange={e => upd("og_image_url", e.target.value)} /></Field>
          <Field label="SEO description">
            <textarea rows={2} value={v.seo_description ?? ""} onChange={e => upd("seo_description", e.target.value)}
              className="w-full border border-ink/20 bg-transparent p-3 text-sm focus:outline-none focus:border-ink" />
          </Field>
        </div>
      </div>

      {err && <p className="text-sm text-red-600 border border-red-200 bg-red-50 p-3">{err}</p>}
      {msg && <p className="text-sm text-green-700 border border-green-200 bg-green-50 p-3">{msg}</p>}

      <div className="flex gap-4">
        <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
        <a href={pageKey === "home" ? "/" : `/${pageKey}`} target="_blank"
          className="text-xs uppercase tracking-widest self-center hover:underline">View page ↗</a>
      </div>
    </div>
  );
}
