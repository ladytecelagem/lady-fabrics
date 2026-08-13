"use client";

import { useRef, useState } from "react";

export function MediaUploader() {
  const ref = useRef<HTMLInputElement>(null);
  const [urls, setUrls] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true); setErr("");
    try {
      const out: string[] = [];
      for (const f of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", f);
        fd.append("folder", "media");
        // eslint-disable-next-line no-await-in-loop
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        // eslint-disable-next-line no-await-in-loop
        const j = await res.json();
        if (!res.ok) throw new Error(j.error);
        out.push(j.url);
      }
      setUrls(u => [...out, ...u]);
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); if (ref.current) ref.current.value = ""; }
  };

  return (
    <div className="max-w-3xl">
      <button onClick={() => ref.current?.click()} disabled={busy}
        className="border border-ink/20 px-5 h-11 text-xs uppercase tracking-widest hover:border-ink">
        {busy ? "Uploading…" : "Upload images"}
      </button>
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={e => add(e.target.files)} />
      {err && <p className="text-sm text-red-600 mt-4">{err}</p>}

      <div className="mt-8 space-y-4">
        {urls.map(u => (
          <div key={u} className="flex items-center gap-4 border-b border-ink/5 pb-4">
            <div className="w-16 h-16 border border-ink/10 overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="w-full h-full object-cover" />
            </div>
            <code className="text-[11px] break-all flex-1">{u}</code>
            <button onClick={() => navigator.clipboard.writeText(u)}
              className="text-[11px] uppercase tracking-widest hover:underline shrink-0">Copy</button>
          </div>
        ))}
      </div>
    </div>
  );
}
