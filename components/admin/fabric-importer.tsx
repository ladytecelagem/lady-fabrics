"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Colorway = { name: string; code: string; hex: string };
type Parsed = {
  name: string;
  composition: string;
  weight: number | null;
  width: number | null;
  description: string;
  care: string | null;
  certifications: string[];
  applications: string[];
  colorways: Colorway[];
};

export function FabricImporter({ collections }: { collections: { _id: string; title: string }[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [collectionId, setCollectionId] = useState("");
  const [busy, setBusy] = useState<"" | "parsing" | "saving">("");
  const [error, setError] = useState("");
  const [data, setData] = useState<Parsed | null>(null);
  const [saved, setSaved] = useState<{ slug: string; colorways: number } | null>(null);

  const parse = async () => {
    if (!file) return;
    setBusy("parsing"); setError(""); setSaved(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/fabric-import", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "parse failed");
      setData(json.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  const save = async () => {
    if (!data || !collectionId) return;
    setBusy("saving"); setError("");
    try {
      const res = await fetch("/api/fabric-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, collectionId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "save failed");
      setSaved({ slug: json.slug, colorways: json.colorways });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  const upd = (k: keyof Parsed, v: any) => setData(d => (d ? { ...d, [k]: v } : d));
  const updCw = (i: number, k: keyof Colorway, v: string) =>
    setData(d => d ? { ...d, colorways: d.colorways.map((c, j) => j === i ? { ...c, [k]: v } : c) } : d);

  return (
    <div className="space-y-10">
      {/* STEP 1 */}
      <section className="border border-ink/10 p-6">
        <p className="text-xs uppercase tracking-widest text-stone mb-4">1 — Color card PDF</p>
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="file" accept="application/pdf"
            onChange={e => { setFile(e.target.files?.[0] ?? null); setData(null); setSaved(null); }}
            className="text-sm file:mr-4 file:border file:border-ink/20 file:bg-transparent file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-widest"
          />
          <Button onClick={parse} disabled={!file || busy !== ""}>
            {busy === "parsing" ? "Reading…" : "Read PDF"}
          </Button>
        </div>
        {busy === "parsing" && (
          <p className="text-xs text-stone mt-3">Extracting specs and colorways. Large cards take up to a minute.</p>
        )}
      </section>

      {error && <p className="text-sm text-red-600 border border-red-200 bg-red-50 p-4">{error}</p>}

      {/* STEP 2 */}
      {data && !saved && (
        <>
          <section className="border border-ink/10 p-6 space-y-6">
            <p className="text-xs uppercase tracking-widest text-stone">2 — Review</p>

            <div className="grid md:grid-cols-2 gap-6">
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-stone">Name</span>
                <Input value={data.name ?? ""} onChange={e => upd("name", e.target.value)} />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-stone">Collection *</span>
                <select
                  value={collectionId}
                  onChange={e => setCollectionId(e.target.value)}
                  className="h-12 w-full border-b border-ink/30 bg-transparent text-sm focus:outline-none focus:border-ink"
                >
                  <option value="">Select…</option>
                  {collections.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs uppercase tracking-widest text-stone">Composition</span>
                <Input value={data.composition ?? ""} onChange={e => upd("composition", e.target.value)} />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-stone">Weight (g/m²)</span>
                <Input type="number" value={data.weight ?? ""} onChange={e => upd("weight", e.target.value ? Number(e.target.value) : null)} />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-stone">Width (cm)</span>
                <Input type="number" value={data.width ?? ""} onChange={e => upd("width", e.target.value ? Number(e.target.value) : null)} />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs uppercase tracking-widest text-stone">Description</span>
                <textarea
                  rows={3} value={data.description ?? ""}
                  onChange={e => upd("description", e.target.value)}
                  className="w-full border border-ink/20 bg-transparent p-3 text-sm focus:outline-none focus:border-ink mt-2"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs uppercase tracking-widest text-stone">Care</span>
                <Input value={data.care ?? ""} onChange={e => upd("care", e.target.value)} />
              </label>
            </div>

            {data.certifications?.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-stone mb-2">Certifications</p>
                <div className="flex flex-wrap gap-2">
                  {data.certifications.map(c => (
                    <span key={c} className="px-3 py-1 border border-ink/20 text-xs uppercase tracking-wider">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="border border-ink/10 p-6">
            <div className="flex items-baseline justify-between mb-6">
              <p className="text-xs uppercase tracking-widest text-stone">3 — Colorways</p>
              <p className="text-xs text-stone">{data.colorways?.length ?? 0} found</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {data.colorways?.map((cw, i) => (
                <div key={i} className="space-y-1">
                  <div className="aspect-square border border-ink/10" style={{ backgroundColor: cw.hex }} />
                  <Input
                    value={cw.code ?? ""} onChange={e => updCw(i, "code", e.target.value)}
                    className="h-8 text-xs" placeholder="code"
                  />
                  <Input
                    value={cw.hex ?? ""} onChange={e => updCw(i, "hex", e.target.value)}
                    className="h-8 text-xs font-mono" placeholder="#RRGGBB"
                  />
                </div>
              ))}
            </div>

            <p className="text-xs text-stone mt-6">
              Hex values are visual estimates. Adjust any that look off — or replace with real swatch photos later in the Studio.
            </p>
          </section>

          <div className="flex items-center gap-4">
            <Button onClick={save} disabled={!collectionId || busy !== ""}>
              {busy === "saving" ? "Saving…" : "Create fabric"}
            </Button>
            {!collectionId && <p className="text-xs text-stone">Select a collection first.</p>}
          </div>
        </>
      )}

      {/* DONE */}
      {saved && (
        <section className="border border-ink/10 p-6">
          <p className="text-display text-2xl mb-2">Fabric created</p>
          <p className="text-sm text-stone mb-6">{saved.colorways} colorways imported.</p>
          <div className="flex flex-wrap gap-4">
            <Button asChild><a href={`/fabrics/${saved.slug}`} target="_blank">View page ↗</a></Button>
            <a href={`/studio/structure/fabric;fabric.${saved.slug}`} target="_blank"
              className="text-xs uppercase tracking-widest self-center hover:underline">Edit in Studio ↗</a>
            <button onClick={() => { setData(null); setFile(null); setSaved(null); }}
              className="text-xs uppercase tracking-widest self-center hover:underline">Import another</button>
          </div>
        </section>
      )}
    </div>
  );
}
