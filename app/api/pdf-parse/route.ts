import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { renderPdfToImages, uploadPageImages, extractMetadataAI, syncPagesToSanity, type ParsedPage } from "@/lib/pdf/parser";
import { requireAdmin } from "@/lib/auth/admin";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { jobId, sanityDocId, storagePath } = await req.json();
  const sb = createServiceClient();

  try {
    await sb.from("sample_book_jobs").update({ status: "processing" }).eq("id", jobId);

    const { data: file, error } = await sb.storage.from("sample-books-source").download(storagePath);
    if (error || !file) throw error || new Error("file not found");

    const buf = await file.arrayBuffer();
    const images = await renderPdfToImages(buf);
    const urls = await uploadPageImages(jobId, images);

    const pages: ParsedPage[] = [];
    for (let i = 0; i < urls.length; i++) {
      const meta = await extractMetadataAI(urls[i]);
      pages.push({ pageNumber: i + 1, imageUrl: urls[i], ...meta });
    }

    if (sanityDocId) await syncPagesToSanity(sanityDocId, pages);

    await sb.from("sample_book_jobs").update({
      status: "complete", page_count: pages.length, extracted: { pages },
    }).eq("id", jobId);

    return NextResponse.json({ ok: true, pages: pages.length });
  } catch (e: any) {
    await sb.from("sample_book_jobs").update({ status: "failed", error: e.message }).eq("id", jobId);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
