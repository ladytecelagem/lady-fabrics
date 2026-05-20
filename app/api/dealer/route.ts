import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  company: z.string().min(2), name: z.string().min(2), email: z.string().email(),
  phone: z.string().optional(), country: z.string().optional(), market: z.string().optional(),
  website: z.string().optional(), message: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());
    const sb = createServiceClient();
    const { error } = await sb.from("dealer_requests").insert({
      company: data.company, contact_name: data.name, email: data.email,
      phone: data.phone, country: data.country, market: data.market,
      website: data.website, message: data.message,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
