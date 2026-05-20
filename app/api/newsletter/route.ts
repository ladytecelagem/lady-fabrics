import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const schema = z.object({ email: z.string().email(), name: z.string().optional() });

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());
    const sb = createServiceClient();
    const { error } = await sb.from("newsletter_subscribers")
      .upsert({ email: data.email, name: data.name }, { onConflict: "email" });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
