"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageField, GalleryField } from "@/components/admin/image-field";

type Row = {
  id?: string;
  name?: string;
  slug?: string;
  subtitle?: string | null;
  tagline?: string | null;
  story?: string | null;
  fiber?: string | null;
  applications?: string[] | null;
  hero_image_url?: string | null;
  gallery?: string[] | null;
  order?: number | null;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image_url?: string | null;
};

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 96);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-xs uppercase tracking-widest text-stone">{label}</span>
    <div className="mt-1">{children}</div>
  </label>
);

export function CollectionEditor({ initial }: { initial: Row | null }) {
  const router = useRouter();
  const isNew = !initial?.id;
  const [v, setV] = useState<Row>(initial ?? { order: 0, applications: [], gallery: [] });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const upd = (k: keyof Row, val: any) => setV(s => ({ ...s, [k]: val }));

  const save = async () => {
    if (!v.name) { setErr("Name obrigatório"); return; }
    setBusy(true); setErr(""); setMsg("");
    const slug = v.slug || slugify(v.name);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isNew ? "create" : "update",
          table: "collections",
          id: v.id,
          values: {
            name: v.name, slug, subtitle: v.subtitle, tagline: v.tagline, story: v.story,
            fiber: v.fiber, applications: v.applications ?? [],
            hero_image_url: v.hero_image_url, gallery: v.gallery ?? [],
            order: Number(v.order ?? 0),
            seo_title: v.seo_title, seo_description: v.seo_description, og_image_url: v.og_image_url,
          },
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "save failed");
      setV(s => ({ ...s, slug }));
      setMsg("Saved. O site atualiza em até 60s.");
      if (isNew && j.id) router.replace(`/admin/collections/${j.id}`);
      router.refresh();
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  const del = async () => {
    if (!v.id || !confirm("Delete this collection?")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", table: "collections", id: v.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      router.push("/admin/collections");
    } catch (e: any) { setErr(e.message); setBusy(false); }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Name"><Input value={v.name ?? ""} onChange={e => upd("name", e.target.value)} /></Field>
        <Field label="Slug (auto)"><Input value={v.slug ?? ""} onChange={e => upd("slug", e.target.value)} placeholder="auto do nome" /></Field>
        <Field label="Fiber"><Input value={v.fiber ?? ""} onChange={e => upd("fiber", e.target.value)} placeholder="100% Wool / Polyester…" /></Field>
        <Field label="Order"><Input type="number" value={v.order ?? 0} onChange={e => upd("order", e.target.value)} /></Field>
      </div>

      <Field label="Subtitle"><Input value={v.subtitle ?? ""} onChange={e => upd("subtitle", e.target.value)} /></Field>
      <Field label="Tagline"><Input value={v.tagline ?? ""} onChange={e => upd("tagline", e.target.value)} /></Field>

      <Field label="Applications (uma por linha)">
        <textarea rows={4} value={(v.applications ?? []).join("\n")}
          onChange={e => upd("applications", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))}
          className="w-full border border-ink/20 bg-transparent p-3 text-sm focus:outline-none focus:border-ink" />
      </Field>

      <Field label="Story (parágrafos separados por linha em branco)">
        <textarea rows={12} value={v.story ?? ""} onChange={e => upd("story", e.target.value)}
          className="w-full border border-ink/20 bg-transparent p-3 text-sm font-mono focus:outline-none focus:border-ink" />
      </Field>

      <div className="border-t border-ink/10 pt-6 space-y-6">
        <ImageField label="Hero image" value={v.hero_image_url ?? null} onChange={url => upd("hero_image_url", url)} />
        <GalleryField label="Gallery" value={v.gallery ?? []} onChange={g => upd("gallery", g)} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 border-t border-ink/10 pt-6">
        <Field label="SEO title"><Input value={v.seo_title ?? ""} onChange={e => upd("seo_title", e.target.value)} /></Field>
        <Field label="SEO description">
          <textarea rows={2} value={v.seo_description ?? ""} onChange={e => upd("seo_description", e.target.value)}
            className="w-full border border-ink/20 bg-transparent p-3 text-sm focus:outline-none focus:border-ink" />
        </Field>
      </div>
      <ImageField label="OG image" value={v.og_image_url ?? null} onChange={url => upd("og_image_url", url)} folder="og" />

      {err && <p className="text-sm text-red-600 border border-red-200 bg-red-50 p-3">{err}</p>}
      {msg && <p className="text-sm text-green-700 border border-green-200 bg-green-50 p-3">{msg}</p>}

      <div className="flex gap-4 items-center">
        <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
        {v.slug && <a href={`/collections/${v.slug}`} target="_blank" className="text-xs uppercase tracking-widest hover:underline">View ↗</a>}
        {!isNew && <button onClick={del} className="ml-auto text-xs uppercase tracking-widest text-red-600 hover:underline">Delete</button>}
      </div>
    </div>
  );
}
