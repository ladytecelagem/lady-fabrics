"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type NewsRow = {
  id?: string;
  title?: string;
  slug?: string;
  category?: string | null;
  excerpt?: string | null;
  body?: string | null;
  cover_image_url?: string | null;
  author_name?: string | null;
  published_at?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
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

export function NewsEditor({ initial }: { initial: NewsRow | null }) {
  const router = useRouter();
  const isNew = !initial?.id;
  const [v, setV] = useState<NewsRow>(initial ?? { published_at: new Date().toISOString().slice(0, 10) });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const upd = (k: keyof NewsRow, val: any) => setV(s => ({ ...s, [k]: val }));

  const save = async () => {
    if (!v.title) { setErr("Title obrigatório"); return; }
    setBusy(true); setErr(""); setMsg("");
    const slug = v.slug || slugify(v.title);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isNew ? "create" : "update",
          table: "news",
          id: v.id,
          values: {
            title: v.title, slug, category: v.category, excerpt: v.excerpt, body: v.body,
            cover_image_url: v.cover_image_url, author_name: v.author_name,
            published_at: v.published_at ? new Date(v.published_at).toISOString() : null,
            seo_title: v.seo_title, seo_description: v.seo_description,
          },
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "save failed");
      setMsg("Saved.");
      if (isNew && j.id) router.replace(`/admin/content-news/${j.id}`);
      router.refresh();
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  const del = async () => {
    if (!v.id || !confirm("Delete this article?")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", table: "news", id: v.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      router.push("/admin/content-news");
    } catch (e: any) { setErr(e.message); setBusy(false); }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Field label="Title"><Input value={v.title ?? ""} onChange={e => upd("title", e.target.value)} /></Field>
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Slug (auto)"><Input value={v.slug ?? ""} onChange={e => upd("slug", e.target.value)} placeholder="auto do título" /></Field>
        <Field label="Category"><Input value={v.category ?? ""} onChange={e => upd("category", e.target.value)} placeholder="Trends / Market / …" /></Field>
        <Field label="Published date"><Input type="date" value={(v.published_at ?? "").slice(0, 10)} onChange={e => upd("published_at", e.target.value)} /></Field>
        <Field label="Author"><Input value={v.author_name ?? ""} onChange={e => upd("author_name", e.target.value)} /></Field>
      </div>
      <Field label="Cover image URL"><Input value={v.cover_image_url ?? ""} onChange={e => upd("cover_image_url", e.target.value)} placeholder="https://…" /></Field>
      <Field label="Excerpt">
        <textarea rows={2} value={v.excerpt ?? ""} onChange={e => upd("excerpt", e.target.value)}
          className="w-full border border-ink/20 bg-transparent p-3 text-sm focus:outline-none focus:border-ink" />
      </Field>
      <Field label="Body (parágrafos separados por linha em branco)">
        <textarea rows={14} value={v.body ?? ""} onChange={e => upd("body", e.target.value)}
          className="w-full border border-ink/20 bg-transparent p-3 text-sm font-mono focus:outline-none focus:border-ink" />
      </Field>
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
        {v.slug && <a href={`/news/${v.slug}`} target="_blank" className="text-xs uppercase tracking-widest hover:underline">View ↗</a>}
        {!isNew && <button onClick={del} className="ml-auto text-xs uppercase tracking-widest text-red-600 hover:underline">Delete</button>}
      </div>
    </div>
  );
}
