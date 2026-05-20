import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  phone: z.string().optional(),
  market: z.string().optional(),
  project: z.string().optional(),
  message: z.string().optional(),
  collection: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const sb = createServiceClient();
    const { error } = await sb.from("sample_requests").insert({
      name: data.name, email: data.email, company: data.company, phone: data.phone,
      market: data.market, project_name: data.project, notes: data.message,
      collection_slugs: data.collection ? [data.collection] : [],
      source: req.headers.get("referer") || "",
      locale: req.headers.get("accept-language")?.split(",")[0] || "en",
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
