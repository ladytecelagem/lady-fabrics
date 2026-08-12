"use client";

import { useState } from "react";

type Row = {
  id: string;
  name: string;
  code: string | null;
  color_name: string | null;
  thumb: string | null;
  enabled: boolean;   // já copiado p/ lady-fabrics?
};

export function CurateGrid({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [onlyEnabled, setOnlyEnabled] = useState(false);

  const filtered = rows.filter(r => {
    if (onlyEnabled && !r.enabled) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return r.name.toLowerCase().includes(q)
      || (r.code ?? "").toLowerCase().includes(q)
      || (r.color_name ?? "").toLowerCase().includes(q);
  });

  const enabledCount = rows.filter(r => r.enabled).length;

  const toggle = async (r: Row) => {
    setBusy(r.id);
    const next = !r.enabled;
    try {
      const res = await fetch("/api/admin/curate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: r.id, enable: next }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setRows(rs => rs.map(x => x.id === r.id ? { ...x, enabled: next } : x));
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-6 sticky top-0 bg-paper py-4 z-10">
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search name, code or colour…"
          className="h-11 flex-1 min-w-[240px] border-b border-ink/20 bg-transparent text-sm focus:outline-none focus:border-ink" />
        <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone">
          <input type="checkbox" checked={onlyEnabled} onChange={e => setOnlyEnabled(e.target.checked)} />
          In visualizer only
        </label>
        <span className="text-xs uppercase tracking-widest text-ink">{enabledCount} enabled</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-3">
        {filtered.map(r => (
          <button key={r.id} onClick={() => toggle(r)} disabled={busy === r.id}
            title={`${r.name}${r.code ? ` · ${r.code}` : ""}`}
            className={`group text-left relative ${busy === r.id ? "opacity-50" : ""}`}>
            <div className={`relative aspect-square overflow-hidden border-2 ${r.enabled ? "border-ink" : "border-transparent"}`}>
              {r.thumb
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={r.thumb} alt={r.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-wool" />}
              {r.enabled && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-ink text-bone text-[11px] grid place-items-center rounded-full">✓</div>
              )}
            </div>
            <p className="text-[10px] mt-1 leading-tight truncate">{r.code || r.name}</p>
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-stone text-sm mt-8">No fabrics match.</p>}
    </div>
  );
}
