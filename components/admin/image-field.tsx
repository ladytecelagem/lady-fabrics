"use client";

import { useRef, useState } from "react";

async function upload(file: File, folder: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const j = await res.json();
  if (!res.ok) throw new Error(j.error || "upload failed");
  return j.url as string;
}

export function ImageField({
  label, value, onChange, folder = "collections",
}: { label: string; value: string | null; onChange: (v: string | null) => void; folder?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const pick = async (f: File | null) => {
    if (!f) return;
    setBusy(true); setErr("");
    try { onChange(await upload(f, folder)); }
    catch (e: any) { setErr(e.message); }
    finally { setBusy(false); if (ref.current) ref.current.value = ""; }
  };

  return (
    <div>
      <span className="text-xs uppercase tracking-widest text-stone">{label}</span>
      <div className="mt-2 flex items-start gap-4">
        <div className="w-28 h-28 border border-ink/15 bg-bone/40 shrink-0 overflow-hidden grid place-items-center">
          {value
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={value} alt="" className="w-full h-full object-cover" />
            : <span className="text-[10px] text-stone uppercase tracking-widest">empty</span>}
        </div>
        <div className="flex-1 space-y-2">
          <input
            value={value ?? ""} onChange={e => onChange(e.target.value || null)}
            placeholder="https://… or upload"
            className="h-10 w-full border-b border-ink/20 bg-transparent text-sm focus:outline-none focus:border-ink" />
          <div className="flex gap-3 text-[11px] uppercase tracking-widest">
            <button onClick={() => ref.current?.click()} disabled={busy} className="hover:underline">
              {busy ? "Uploading…" : "Upload"}
            </button>
            {value && <button onClick={() => onChange(null)} className="text-stone hover:underline">Remove</button>}
          </div>
          {err && <p className="text-xs text-red-600">{err}</p>}
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={e => pick(e.target.files?.[0] ?? null)} />
    </div>
  );
}

export function GalleryField({
  label, value, onChange, folder = "collections",
}: { label: string; value: string[]; onChange: (v: string[]) => void; folder?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true); setErr("");
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        // eslint-disable-next-line no-await-in-loop
        urls.push(await upload(f, folder));
      }
      onChange([...value, ...urls]);
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); if (ref.current) ref.current.value = ""; }
  };

  const move = (i: number, d: number) => {
    const n = [...value];
    const j = i + d;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-stone">{label} ({value.length})</span>
        <button onClick={() => ref.current?.click()} disabled={busy}
          className="text-[11px] uppercase tracking-widest hover:underline">
          {busy ? "Uploading…" : "+ Add images"}
        </button>
      </div>
      {err && <p className="text-xs text-red-600 mt-2">{err}</p>}
      <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-3">
        {value.map((url, i) => (
          <div key={url + i} className="relative group">
            <div className="aspect-square border border-ink/15 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-stone">
              <button onClick={() => move(i, -1)} className="hover:text-ink">←</button>
              <button onClick={() => onChange(value.filter((_, k) => k !== i))} className="hover:text-red-600">✕</button>
              <button onClick={() => move(i, 1)} className="hover:text-ink">→</button>
            </div>
          </div>
        ))}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={e => add(e.target.files)} />
    </div>
  );
}
