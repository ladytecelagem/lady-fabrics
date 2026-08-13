"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { VisualizerCanvas, type CanvasHandle } from "./canvas";
import type { VisFabric, VisFurniture } from "./types";
import { Button } from "@/components/ui/button";

type BasketItem = {
  furnitureId: string; furnitureName: string;
  fabricId: string; fabricName: string; fabricCode: string | null;
  preview: string;
};

const codeNum = (c?: string | null) => {
  const n = parseInt(c || "", 10);
  return Number.isNaN(n) ? Number.MAX_SAFE_INTEGER : n;
};

export function VisualizerShell({
  furniture, fabrics,
}: { furniture: VisFurniture[]; fabrics: VisFabric[] }) {
  const [activeFurniture, setActiveFurniture] = useState<VisFurniture | null>(furniture[0] ?? null);
  const [activeFabric, setActiveFabric] = useState<VisFabric | null>(null);
  const [query, setQuery] = useState("");
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [shareUrl, setShareUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<CanvasHandle>(null);

  // ---- móveis agrupados por categoria ----
  const furnitureGroups = useMemo(() => {
    const map = new Map<string, VisFurniture[]>();
    for (const f of furniture) {
      const key = (f.category || "Other").trim();
      (map.get(key) ?? map.set(key, []).get(key)!).push(f);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [furniture]);

  // ---- tecidos: filtro + agrupamento por artigo (name) ----
  const fabricGroups = useMemo(() => {
    const filtered = query
      ? fabrics.filter(f =>
          f.name.toLowerCase().includes(query.toLowerCase()) ||
          (f.code ?? "").toLowerCase().includes(query.toLowerCase()))
      : fabrics;
    const map = new Map<string, VisFabric[]>();
    for (const f of filtered) {
      const key = (f.name || "—").trim();
      (map.get(key) ?? map.set(key, []).get(key)!).push(f);
    }
    const arr = Array.from(map.entries());
    arr.forEach(([, m]) => m.sort((a, b) => {
      const d = codeNum(a.code) - codeNum(b.code);
      return d !== 0 ? d : (a.code || "").localeCompare(b.code || "");
    }));
    arr.sort((a, b) => a[0].localeCompare(b[0]));
    return arr;
  }, [fabrics, query]);

  const addToBasket = () => {
    if (!activeFurniture || !activeFabric) return;
    const preview = canvasRef.current?.toDataURL() ?? "";
    setBasket(b => b.some(i => i.furnitureId === activeFurniture.id && i.fabricId === activeFabric.id)
      ? b
      : [...b, {
          furnitureId: activeFurniture.id, furnitureName: activeFurniture.name,
          fabricId: activeFabric.id, fabricName: activeFabric.name, fabricCode: activeFabric.code, preview,
        }]);
    setShareUrl("");
  };

  const removeItem = (i: number) => { setBasket(b => b.filter((_, j) => j !== i)); setShareUrl(""); };

  const downloadCurrent = () => {
    const url = canvasRef.current?.toDataURL(); if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `lady-fabrics-${activeFurniture?.name ?? "piece"}-${activeFabric?.code ?? activeFabric?.name ?? ""}.jpg`
      .replace(/\s+/g, "-").toLowerCase();
    a.click();
  };

  const createLink = async () => {
    if (basket.length === 0) return;
    setBusy(true); setShareUrl("");
    try {
      const res = await fetch("/api/basket", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: basket.map(({ preview, ...rest }) => rest) }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      const url = `${window.location.origin}/basket/${j.id}`;
      setShareUrl(url);
      navigator.clipboard?.writeText(url).catch(() => {});
    } catch (e: any) { alert("Error: " + e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
      <div className="space-y-6">
        <VisualizerCanvas ref={canvasRef} fabric={activeFabric} furniture={activeFurniture} />

        {/* móveis agrupados por categoria */}
        <div className="space-y-4">
          {furnitureGroups.map(([cat, items]) => (
            <div key={cat}>
              <p className="text-[11px] uppercase tracking-widest text-stone mb-2">{cat}</p>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {items.map(f => (
                  <button key={f.id} onClick={() => setActiveFurniture(f)}
                    className={`relative shrink-0 w-24 aspect-[4/3] overflow-hidden border transition-colors bg-white ${
                      activeFurniture?.id === f.id ? "border-ink" : "border-ink/10 hover:border-ink/40"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.thumb || f.base} alt={f.name} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-ink/10 pt-4">
          {activeFabric && (
            <p className="text-sm mr-auto">
              <span className="text-stone text-xs uppercase tracking-widest mr-2">Applied</span>
              {activeFabric.name}{activeFabric.code ? ` · ${activeFabric.code}` : ""}
            </p>
          )}
          <Button variant="outline" onClick={downloadCurrent} disabled={!activeFabric || !activeFurniture}>Download</Button>
          <Button onClick={addToBasket} disabled={!activeFabric || !activeFurniture}>Add to basket</Button>
        </div>
      </div>

      {/* RIGHT RAIL */}
      <aside className="lg:border-l lg:border-ink/10 lg:pl-8 space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone mb-4">Fabrics</p>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search article or code…"
            className="w-full h-11 border-b border-ink/20 bg-transparent text-sm mb-6 focus:outline-none focus:border-ink" />
          {fabrics.length === 0 && <p className="text-sm text-stone">No fabrics enabled for the visualizer yet.</p>}

          <div className="space-y-6 max-h-[52vh] overflow-y-auto pr-1">
            {fabricGroups.map(([article, colors]) => (
              <div key={article}>
                <p className="text-[11px] uppercase tracking-widest text-ink mb-2 sticky top-0 bg-paper py-1">{article}</p>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map(f => (
                    <button key={f.id} onClick={() => setActiveFabric(f)}
                      title={`${f.name}${f.code ? ` · ${f.code}` : ""}`}
                      className={`group text-left ${activeFabric?.id === f.id ? "ring-2 ring-ink" : ""}`}>
                      <div className="relative aspect-square overflow-hidden bg-white border border-ink/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={f.swatch} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <p className="text-[10px] mt-0.5 leading-tight truncate text-stone">{f.code}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BASKET */}
        <div className="border-t border-ink/10 pt-6">
          <p className="text-xs uppercase tracking-[0.3em] text-stone mb-4">Virtual basket ({basket.length})</p>
          {basket.length === 0 && <p className="text-sm text-stone">Add combinations to collect and share them.</p>}
          <div className="space-y-3">
            {basket.map((it, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-14 h-11 bg-white border border-ink/10 overflow-hidden shrink-0">
                  {it.preview && /* eslint-disable-next-line @next/next/no-img-element */ <img src={it.preview} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs truncate">{it.furnitureName}</p>
                  <p className="text-[11px] text-stone truncate">{it.fabricName}{it.fabricCode ? ` · ${it.fabricCode}` : ""}</p>
                </div>
                <button onClick={() => removeItem(i)} className="text-stone hover:text-ink text-xs">✕</button>
              </div>
            ))}
          </div>
          {basket.length > 0 && (
            <div className="mt-5 space-y-3">
              <Button className="w-full" onClick={createLink} disabled={busy}>
                {busy ? "Creating link…" : "Create shareable link"}
              </Button>
              {shareUrl && (
                <div className="text-xs">
                  <p className="text-green-700 mb-1">Link copied to clipboard:</p>
                  <Link href={shareUrl} className="underline break-all" target="_blank">{shareUrl}</Link>
                </div>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/contact?intent=sample&basket=${basket.map(b => b.fabricId).join(",")}`}>Request these samples</Link>
              </Button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
