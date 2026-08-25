"use client";

import { useMemo, useState } from "react";

type Row = {
  id: string;
  name: string;
  code: string | null;
  color_name: string | null;
  thumb: string | null;
  assigned: boolean;
  otherCollection: string | null;
};

const codeNum = (c: string | null) => {
  const n = parseInt(c || "", 10);
  return Number.isNaN(n) ? Number.MAX_SAFE_INTEGER : n;
};

export function CollectionFabrics({ collectionId, initial }: { collectionId: string; initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [query, setQuery] = useState("");
  const [onlyAssigned, setOnlyAssigned] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const filtered = rows.filter(r => {
    if (onlyAssigned && !r.assigned) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return r.name.toLowerCase().includes(q)
      || (r.code ?? "").toLowerCase().includes(q)
      || (r.color_name ?? "").toLowerCase().includes(q);
  });

  const groups = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const r of filtered) {
      const key = (r.name || "—").trim();
      (map.get(key) ?? map.set(key, []).get(key)!).push(r);
    }
    const arr = Array.from(map.entries());
    arr.forEach(([, m]) => m.sort((a, b) => {
      const d = codeNum(a.code) - codeNum(b.code);
      return d !== 0 ? d : (a.code || "").localeCompare(b.code || "");
    }));
    arr.sort((a, b) => a[0].localeCompare(b[0]));
    return arr;
  }, [filtered]);

  const assignedCount = rows.filter(r => r.assigned).length;
  const isOpen = (g: string) => !collapsed.has(g);
  const toggleCollapse = (g: string) =>
    setCollapsed(s => { const n = new Set(s); n.has(g) ? n.delete(g) : n.add(g); return n; });
  const allCollapsed = groups.length > 0 && groups.every(([g]) => collapsed.has(g));
  const toggleAll = () =>
    setCollapsed(allCollapsed ? new Set<string>() : new Set(groups.map(([g]) => g)));

  const setAssigned = async (r: Row, next: boolean) => {
    if (r.assigned === next) return;
    setBusy(r.id);
    try {
      const res = await fetch("/api/admin/collection-fabrics", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: r.id, collectionId, assign: next }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setRows(rs => rs.map(x => x.id === r.id ? { ...x, assigned: next, otherCollection: null } : x));
    } catch (e: any) { alert("Error: " + e.message); }
    finally { setBusy(null); }
  };

  const groupAll = async (members: Row[], next: boolean) => {
    for (const r of members) {
      if (r.assigned !== next) {
        // eslint-disable-next-line no-await-in-loop
        await setAssigned(r, next);
      }
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-6 sticky top-0 bg-paper py-4 z-10 border-b border-ink/5">
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search article, code or colour…"
          className="h-11 flex-1 min-w-[220px] border-b border-ink/20 bg-transparent text-sm focus:outline-none focus:border-ink" />
        <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone">
          <input type="checkbox" checked={onlyAssigned} onChange={e => setOnlyAssigned(e.target.checked)} />
          In this collection
        </label>
        <button onClick={toggleAll}
          className="text-[11px] uppercase tracking-widest border border-ink/20 px-3 h-8 hover:border-ink">
          {allCollapsed ? "Expand all" : "Collapse all"}
        </button>
        <span className="text-xs uppercase tracking-widest text-ink">{assignedCount} in collection</span>
      </div>

      <div className="space-y-8">
        {groups.map(([article, members]) => {
          const on = members.filter(r => r.assigned).length;
          return (
            <section key={article}>
              <div className="flex items-center justify-between mb-4 border-b border-ink/10 pb-2">
                <button onClick={() => toggleCollapse(article)} className="flex items-baseline gap-3 text-left">
                  <span className="text-xs text-stone w-3">{isOpen(article) ? "▾" : "▸"}</span>
                  <h3 className="text-display text-2xl">{article}</h3>
                  <span className="text-xs text-stone">{on}/{members.length}</span>
                </button>
                <div className="flex gap-3 text-[11px] uppercase tracking-widest">
                  <button onClick={() => groupAll(members, true)} className="hover:underline">Add all</button>
                  <button onClick={() => groupAll(members, false)} className="hover:underline text-stone">Clear</button>
                </div>
              </div>

              {isOpen(article) && (
                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-3">
                  {members.map(r => (
                    <button key={r.id} onClick={() => setAssigned(r, !r.assigned)} disabled={busy === r.id}
                      title={r.otherCollection ? `Já em: ${r.otherCollection}` : undefined}
                      className={`relative aspect-square border transition ${
                        r.assigned ? "border-ink ring-2 ring-ink/20" : "border-ink/10 hover:border-ink/40"
                      } ${busy === r.id ? "opacity-40" : ""}`}>
                      {r.thumb
                        /* eslint-disable-next-line @next/next/no-img-element */
                        ? <img src={r.thumb} alt="" className="w-full h-full object-cover" />
                        : <span className="text-[10px] text-stone">{r.code}</span>}
                      <span className="absolute bottom-0 inset-x-0 bg-paper/85 text-[10px] py-0.5 text-center">
                        {r.code}{r.otherCollection && !r.assigned ? " •" : ""}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {groups.length === 0 && <p className="text-stone text-sm">Nada encontrado.</p>}
    </div>
  );
}
