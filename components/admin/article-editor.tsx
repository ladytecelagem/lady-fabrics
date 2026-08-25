"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageField, GalleryField } from "@/components/admin/image-field";

type Row = {
  id: string;
  name?: string;
  slug?: string;
  subtitle?: string | null;
  description?: string | null;
  composition?: string | null;
  width?: string | null;
  weight?: string | null;
  abrasion?: string | null;
  finish?: string | null;
  care?: string | null;
  applications?: string[] | null;
  certifications?: string[] | null;
  hero_image_url?: string | null;
  gallery?: string[] | null;
  order?: number | null;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image_url?: string | null;
};

type Colour = { id: string; code: string | null; color_name: string | null; thumb_url: string | null; swatch_url: string | null };

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-xs uppercase tracking-widest text-stone">{label}</span>
    <div className="mt-1">{children}</div>
  </label>
);

export function ArticleEditor({
  initial, colours, collectionSlug,
}: { initial: Row; colours: Colour[]; collectionSlug: string | null }) {
  const router = useRouter();
  const [v, setV] = useState<Row>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const upd = (k: keyof Row, val: any) => setV(s => ({ ...s, [k]: val }));

  const save = async () => {
    setBusy(true); setErr(""); setMsg("");
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update", id: v.id,
          values: {
            name: v.name, subtitle: v.subtitle, description: v.description,
            composition: v.composition, width: v.width, weight: v.weight,
            abrasion: v.abrasion, finish: v.finish, care: v.care,
            applications: v.applications ?? [], certifications: v.certifications ?? [],
            hero_image_url: v.hero_image_url, gallery: v.gallery ?? [],
            order: Number(v.order ?? 0),
            seo_title: v.seo_title, seo_description: v.seo_description, og_image_url: v.og_image_url,
          },
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "save failed");
      setMsg("Saved. O site atualiza em até 60s.");
      router.refresh();
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Name"><Input value={v.name ?? ""} onChange={e => upd("name", e.target.value)} /></Field>
        <Field label="Slug (fixo)"><Input value={v.slug ?? ""} readOnly className="text-stone" /></Field>
        <Field label="Order"><Input type="number" value={v.order ?? 0} onChange={e => upd("order", e.target.value)} /></Field>
        <Field label="Composition"><Input value={v.composition ?? ""} onChange={e => upd("composition", e.target.value)} placeholder="100% Wool" /></Field>
        <Field label="Width"><Input value={v.width ?? ""} onChange={e => upd("width", e.target.value)} placeholder="140 cm" /></Field>
        <Field label="Weight"><Input value={v.weight ?? ""} onChange={e => upd("weight", e.target.value)} placeholder="480 g/m²" /></Field>
        <Field label="Abrasion"><Input value={v.abrasion ?? ""} onChange={e => upd("abrasion", e.target.value)} placeholder="100,000 Martindale" /></Field>
        <Field label="Finish"><Input value={v.finish ?? ""} onChange={e => upd("finish", e.target.value)} /></Field>
      </div>

      <Field label="Subtitle"><Input value={v.subtitle ?? ""} onChange={e => upd("subtitle", e.target.value)} /></Field>
      <Field label="Care"><Input value={v.care ?? ""} onChange={e => upd("care", e.target.value)} /></Field>

      <Field label="Description (parágrafos separados por linha em branco)">
        <textarea rows={10} value={v.description ?? ""} onChange={e => upd("description", e.target.value)}
          className="w-full border border-ink/20 bg-transparent p-3 text-sm font-mono focus:outline-none focus:border-ink" />
      </Field>

      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Applications (uma por linha)">
          <textarea rows={4} value={(v.applications ?? []).join("\n")}
            onChange={e => upd("applications", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))}
            className="w-full border border-ink/20 bg-transparent p-3 text-sm focus:outline-none focus:border-ink" />
        </Field>
        <Field label="Certifications (uma por linha)">
          <textarea rows={4} value={(v.certifications ?? []).join("\n")}
            onChange={e => upd("certifications", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))}
            className="w-full border border-ink/20 bg-transparent p-3 text-sm focus:outline-none focus:border-ink" />
        </Field>
      </div>

      <div className="border-t border-ink/10 pt-6 space-y-6">
        <ImageField label="Cover image (card + hero)" value={v.hero_image_url ?? null}
          onChange={url => upd("hero_image_url", url)} folder="articles" />
        <GalleryField label="Gallery" value={v.gallery ?? []} onChange={g => upd("gallery", g)} folder="articles" />
      </div>

      <div className="border-t border-ink/10 pt-6">
        <p className="text-xs uppercase tracking-widest text-stone mb-4">Colours ({colours.length}) — gerenciadas na coleção</p>
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
          {colours.map(c => (
            <div key={c.id} title={`${c.code ?? ""} ${c.color_name ?? ""}`}>
              <div className="aspect-square border border-ink/10 overflow-hidden">
                {(c.thumb_url || c.swatch_url) &&
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={(c.thumb_url || c.swatch_url) as string} alt="" className="w-full h-full object-cover" />}
              </div>
              <p className="text-[10px] text-stone text-center mt-1">{c.code}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 border-t border-ink/10 pt-6">
        <Field label="SEO title"><Input value={v.seo_title ?? ""} onChange={e => upd("seo_title", e.target.value)} /></Field>
        <Field label="SEO description">
          <textarea rows={2} value={v.seo_description ?? ""} onChange={e => upd("seo_description", e.target.value)}
            className="w-full border border-ink/20 bg-transparent p-3 text-sm focus:outline-none focus:border-ink" />
        </Field>
      </div>

      {err && <p className="text-sm text-red-600 border border-red-200 bg-red-50 p-3">{err}</p>}
      {msg && <p className="text-sm text-green-700 border border-green-200 bg-green-50 p-3">{msg}</p>}

      <div className="flex gap-4 items-center">
        <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
        {collectionSlug && v.slug && (
          <a href={`/collections/${collectionSlug}/${v.slug}`} target="_blank"
            className="text-xs uppercase tracking-widest hover:underline">View ↗</a>
        )}
      </div>
    </div>
  );
}
