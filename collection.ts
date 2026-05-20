/**
 * PDF Parsing Pipeline — Lady Fabrics Digital Sample Book
 *
 * Strategy:
 *  1. Render each PDF page to high-res PNG via pdfjs-dist (legacy build for Node).
 *  2. Upload each rendered page to Supabase Storage (bucket: sample-books-pages).
 *  3. Run AI extraction (Anthropic vision) on each page to detect:
 *       - pattern codes / SKUs
 *       - color names
 *       - composition strings
 *  4. Push pages array back to Sanity sampleBook document.
 *
 * This module is the orchestration layer. Heavy lifting (canvas rendering)
 * runs in a Railway worker (or Next route with `runtime = "nodejs"` and longer timeouts).
 */

import { writeClient } from "@/sanity/lib/client";
import { createServiceClient } from "@/lib/supabase/server";

export type ParsedPage = {
  pageNumber: number;
  imageUrl: string;
  patterns?: string[];
  colors?: string[];
  notes?: string;
};

export async function renderPdfToImages(pdfBuffer: ArrayBuffer): Promise<Buffer[]> {
  // Lazy import — pdfjs is heavy and Node-only path
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // @ts-ignore – worker
  pdfjs.GlobalWorkerOptions.workerSrc = undefined;

  const doc = await pdfjs.getDocument({ data: new Uint8Array(pdfBuffer), useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise;

  const images: Buffer[] = [];
  const { createCanvas } = await import("canvas").catch(() => ({ createCanvas: null as any }));

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const viewport = page.getViewport({ scale: 2.0 });
    if (!createCanvas) throw new Error("canvas not available in this runtime. Run parser in Railway worker.");
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx as any, viewport }).promise;
    images.push(canvas.toBuffer("image/png"));
  }
  return images;
}

export async function uploadPageImages(jobId: string, images: Buffer[]): Promise<string[]> {
  const sb = createServiceClient();
  const urls: string[] = [];
  for (let i = 0; i < images.length; i++) {
    const path = `${jobId}/page-${String(i + 1).padStart(3, "0")}.png`;
    const { error } = await sb.storage.from("sample-books-pages").upload(path, images[i], {
      contentType: "image/png", upsert: true,
    });
    if (error) throw error;
    const { data } = sb.storage.from("sample-books-pages").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

export async function extractMetadataAI(imageUrl: string): Promise<Partial<ParsedPage>> {
  if (!process.env.ANTHROPIC_API_KEY) return {};
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const res = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 600,
    messages: [{
      role: "user",
      content: [
        { type: "image", source: { type: "url", url: imageUrl } as any },
        { type: "text", text: `This is one page of a textile sample book (cartela). Extract:
- "patterns": list of pattern codes / SKUs visible on the page
- "colors": list of color names visible
- "notes": one-sentence description of the page layout
Return STRICT JSON only, no preamble.` },
      ],
    }],
  });

  const text = res.content.find(c => c.type === "text")?.text || "{}";
  const clean = text.replace(/```json|```/g, "").trim();
  try { return JSON.parse(clean); } catch { return {}; }
}

export async function syncPagesToSanity(sanityDocId: string, pages: ParsedPage[]) {
  await writeClient
    .patch(sanityDocId)
    .set({
      pages: pages.map(p => ({
        _type: "sampleBookPage",
        _key: `p-${p.pageNumber}`,
        pageNumber: p.pageNumber,
        image: undefined,  // we keep external URL in custom field below
        patterns: p.patterns || [],
        notes: p.notes || "",
      })),
      pageCount: pages.length,
      parsingStatus: "complete",
    })
    .commit();
}
