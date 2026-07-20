"use client";

import { useState } from "react";
import Link from "next/link";
import { VisualizerCanvas } from "./canvas";
import type { FabricVis, FurnitureVis } from "./types";
import { Button } from "@/components/ui/button";

export function VisualizerShell({
  furniture,
  fabrics,
}: {
  furniture: FurnitureVis[];
  fabrics: FabricVis[];
}) {
  const [activeFurniture, setActiveFurniture] = useState<FurnitureVis | null>(furniture[0] ?? null);
  const [activeFabric, setActiveFabric] = useState<FabricVis | null>(null);
  const [query, setQuery] = useState("");

  const filtered = query
    ? fabrics.filter(f =>
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        (f.code ?? "").toLowerCase().includes(query.toLowerCase()))
    : fabrics;

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
      {/* STAGE */}
      <div className="space-y-6">
        <VisualizerCanvas fabric={activeFabric} furniture={activeFurniture} />

        {/* furniture selector */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {furniture.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFurniture(f)}
              className={`relative shrink-0 w-24 aspect-[4/3] overflow-hidden border transition-colors ${
                activeFurniture?.id === f.id ? "border-ink" : "border-ink/10 hover:border-ink/40"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.base} alt={f.name} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {activeFabric && (
          <div className="flex items-center justify-between border-t border-ink/10 pt-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-stone">Applied</p>
              <p className="text-lg">{activeFabric.name}{activeFabric.code ? ` · ${activeFabric.code}` : ""}</p>
            </div>
            <Button asChild>
              <Link href={`/contact?intent=sample&fabric=${activeFabric.id}`}>Request this sample</Link>
            </Button>
          </div>
        )}
      </div>

      {/* FABRIC RAIL */}
      <aside className="lg:border-l lg:border-ink/10 lg:pl-8">
        <p className="text-xs uppercase tracking-[0.3em] text-stone mb-4">Fabrics</p>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search name or code…"
          className="w-full h-11 border-b border-ink/20 bg-transparent text-sm mb-6 focus:outline-none focus:border-ink"
        />

        {fabrics.length === 0 && (
          <p className="text-sm text-stone">
            No fabrics enabled yet. Toggle <em>Show in visualizer</em> on a fabric in the Studio.
          </p>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-3 max-h-[70vh] overflow-y-auto pr-1">
          {filtered.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFabric(f)}
              title={`${f.name}${f.code ? ` · ${f.code}` : ""}`}
              className={`group text-left ${activeFabric?.id === f.id ? "ring-2 ring-ink" : ""}`}
            >
              <div className="relative aspect-square overflow-hidden bg-wool border border-ink/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.swatch} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <p className="text-[11px] mt-1 leading-tight truncate">{f.code || f.name}</p>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
