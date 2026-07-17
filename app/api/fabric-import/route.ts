import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";

export const runtime = "nodejs";
export const maxDuration = 300;

const BUCKET = "sample-books-source";

const PROMPT = `You are parsing a textile color card (cartela) PDF from Lady Fabrics / Tecelagem Lady.

Extract the fabric data and return ONLY a JSON object. No preamble, no markdown fences.

Schema:
{
  "name": string,                 // fabric name, e.g. "Creative"
  "composition": string,          // e.g. "100% Polyester (PES)"
  "weight": number|null,          // g/m2 ONLY (ignore g/m linear). e.g. 275
  "width": number|null,           // cm. e.g. 140
  "description": string,          // 2-3 sentences, English, editorial tone, no marketing cliches
  "care": string|null,            // short care code summary, English
  "certifications": string[],     // protective finishes / standards found (English)
  "applications": string[],       // lowercase, only from: workplace, hospitality, residential, healthcare, corporate, acoustic, furniture, contract, outdoor
  "colorways": [
    { "name": string, "code": string, "hex": string }   // hex "#RRGGBB", your best visual estimate of the swatch
  ]
}

Rules:
- Include EVERY colorway swatch in the document. Do not truncate or summarise.
- "code" is the number under each swatch (e.g. "5589", "784").
- "name" of a colorway: use the label shown; if it is just the fabric name, use the fabric name.
- Estimate "hex" by looking at the swatch image itself, as accurately as you can.
- Translate Portuguese source text to English for description/care/certifications.
- If a field is absent, use null (or [] for arrays). Never invent specs.`;

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "missing ANTHROPIC_API_KEY" }, { status: 500 });
  }

  try {
    const { path } = await req.json();
    if (!path || typeof path !== "string" || !path.startsWith("fabric-imports/")) {
      return NextResponse.json({ error: "invalid path" }, { status: 400 });
    }

    const sb = createServiceClient();
    const { data: file, error } = await sb.storage.from(BUCKET).download(path);
    if (error || !file) throw error || new Error("file not found in storage");

    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      messages: [
        {
          role: "user",
          content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
            { type: "text", text: PROMPT },
          ] as any,
        },
      ],
    });

    const text = msg.content
      .map((b: any) => (b.type === "text" ? b.text : ""))
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "could not parse model output", raw: text.slice(0, 2000) }, { status: 502 });
    }

    // limpeza do arquivo temporário (best effort)
    await sb.storage.from(BUCKET).remove([path]).catch(() => {});

    return NextResponse.json({ ok: true, data }, { headers: { "cache-control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
