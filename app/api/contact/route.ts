import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  name: z.string().min(2), email: z.string().email(),
  company: z.string().optional(), phone: z.string().optional(),
  subject: z.string().optional(), message: z.string().min(10),
});

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());
    const sb = createServiceClient();
    const { error } = await sb.from("contact_messages").insert(data);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
