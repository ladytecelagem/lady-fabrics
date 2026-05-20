"use client";
import { useState } from "react";
import { Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SampleBookUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [sanityDocId, setSanityDocId] = useState("");
  const [status, setStatus] = useState<"idle"|"uploading"|"queued"|"err">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setStatus("uploading"); setMsg("");
    const sb = createClient();
    const filename = `${Date.now()}-${file.name}`;
    const { error: upErr } = await sb.storage.from("sample-books-source").upload(filename, file);
    if (upErr) { setStatus("err"); setMsg(upErr.message); return; }

    const { data: job, error: jobErr } = await sb.from("sample_book_jobs")
      .insert({ filename, storage_path: filename, sanity_doc_id: sanityDocId || null })
      .select("id").single();
    if (jobErr || !job) { setStatus("err"); setMsg(jobErr?.message || "job failed"); return; }

    const res = await fetch("/api/pdf-parse", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: job.id, sanityDocId, storagePath: filename }),
    });
    if (!res.ok) { setStatus("err"); setMsg("parsing failed"); return; }
    setStatus("queued"); setMsg("Parsed successfully.");
  };

  return (
    <form onSubmit={submit} className="border border-dashed border-ink/30 p-8 space-y-6 max-w-2xl">
      <div>
        <label className="text-xs uppercase tracking-widest text-stone">Cartela title (optional)</label>
        <Input value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="text-xs uppercase tracking-widest text-stone">Sanity sampleBook doc ID (optional — links pages back)</label>
        <Input value={sanityDocId} onChange={e => setSanityDocId(e.target.value)} placeholder="e.g. drafts.xyz or xyz" />
      </div>
      <div>
        <label className="text-xs uppercase tracking-widest text-stone block mb-2">PDF file</label>
        <input type="file" accept="application/pdf" required onChange={e => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm" />
      </div>
      <Button type="submit" disabled={status === "uploading" || !file}>
        <Upload className="w-4 h-4" />
        {status === "uploading" ? "Uploading & parsing…" : "Upload & parse"}
      </Button>
      {msg && <p className="text-xs">{msg}</p>}
    </form>
  );
}
