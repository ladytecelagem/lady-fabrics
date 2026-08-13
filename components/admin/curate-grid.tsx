"use client";

import { useMemo, useState } from "react";

type Row = {
  id: string;
  name: string;          // artigo (Adele, Creative...)
  code: string | null;   // cor (05, 07...)
  color_name: string | null;
  thumb: string | null;
  enabled: boolean;
};

const codeNum = (c: string | null) => {
  const n = parseInt(c || "", 10);
  return Number.isNaN(n) ? Number.MAX_SAFE_INTEGER : n;
};

export function CurateGrid({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [onlyEnabled, setOnlyEnabled] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const filtered = rows.filter(r => {
    if (onlyEnabled && !r.enabled) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return r.name.toLowerCase().includes(q)
      || (r.code ?? "").toLowerCase().includes(q)
      || (r.color_name ?? "").toLowerCase().includes(q);
  });

  // agrupar por ARTIGO (name); ordenar cores por code numérico
  const groups = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const r of filtered) {
      const key = (r.name || "—").trim();
      (map.get(key) ?? map.set(key, []).get(key)!).push(r);
    }
    const arr = Array.from(map.entries());
    arr.forEach(([, members]) => members.sort((a, b) => {
      const d = codeNum(a.code) - codeNum(b.code);
      return d !== 0 ? d : (a.code || "").localeCompare(b.code || "");
    }));
    arr.sort((a, b) => a[0].localeCompare(b[0]));
    return arr;
  }, [filtered]);

  const enabledCount = rows.filter(r => r.enabled).length;
  const isOpen = (g: string) => !collapsed.has(g);
  const toggleCollapse = (g: string) =>
    setCollapsed(s => { const n = new Set(s); n.has(g) ? n.delete(g) : n.add(g); return n; });

  const setEnabled = async (r: Row, next: boolean) => {
    if (r.enabled === next) return;
    setBusy(r.id);
    try {
      const res = await fetch("/api/admin/curate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: r.id, enable: next }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setRows(rs => rs.map(x => x.id === r.id ? { ...x, enabled: next } : x));
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally { setBusy(null); }
  };

  const toggleGroupAll = async (members: Row[], enable: boolean) => {
    for (const r of members) {
      if (r.enabled !== enable) {
        // eslint-disable-next-line no-await-in-loop
        await setEnabled(r, enable);
      }
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-6 sticky top-0 bg-paper py-4 z-10 border-b border-ink/5">
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search article, code or colour…"
          className="h-11 flex-1 min-w-[240px] border-b border-ink/20 bg-transparent text-sm focus:outline-none focus:border-ink" />
        <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone">
          <input type="checkbox" checked={onlyEnabled} onChange={e => setOnlyEnabled(e.target.checked)} />
          In visualizer only
        </label>
        <span className="text-xs uppercase tracking-widest text-ink">{enabledCount} enabled</span>
      </div>

      <div className="space-y-8">
        {groups.map(([article, members]) => {
          const on = members.filter(r => r.enabled).length;
          return (
            <section key={article}>
              <div className="flex items-center justify-between mb-4 border-b border-ink/10 pb-2">
                <button onClick={() => toggleCollapse(article)} className="flex items-baseline gap-3 text-left">
                  <span className="text-xs text-stone w-3">{isOpen(article) ? "▾" : "▸"}</span>
                  <h2 className="text-display text-2xl">{article}</h2>
                  <span className="text-xs text-stone">{on}/{members.length}</span>
                </button>
                <div className="flex gap-3 text-[11px] uppercase tracking-widest">
                  <button onClick={() => toggleGroupAll(members, true)} className="hover:underline">Add all</button>
                  <button onClick={() => toggleGroupAll(members, false)} className="hover:underline text-stone">Clear</button>
                </div>
              </div>

              {isOpen(article) && (
                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-3">
                  {members.map(r => (
                    <button key={r.id} onClick={() => setEnabled(r, !r.enabled)} disabled={busy === r.id}
                      title={`${r.name}${r.code ? ` · ${r.code}` : ""}`}
                      className={`group text-left relative ${busy === r.id ? "opacity-50" : ""}`}>
                      <div className={`relative aspect-square overflow-hidden border-2 ${r.enabled ? "border-ink" : "border-transparent"}`}>
                        {r.thumb
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={r.thumb} alt={r.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-white" />}
                        {r.enabled && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-ink text-bone text-[11px] grid place-items-center rounded-full">✓</div>
                        )}
                      </div>
                      <p className="text-[10px] mt-1 leading-tight truncate">{r.code || r.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {filtered.length === 0 && <p className="text-stone text-sm mt-8">No fabrics match.</p>}
    </div>
  );
}
