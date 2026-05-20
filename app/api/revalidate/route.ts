import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type: string; slug?: { current?: string } }>(
      req as any,
      process.env.SANITY_WEBHOOK_SECRET
    );
    if (!isValidSignature) return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    if (!body?._type) return NextResponse.json({ error: "bad payload" }, { status: 400 });

    revalidateTag(body._type);
    if (body.slug?.current) revalidateTag(`${body._type}:${body.slug.current}`);
    return NextResponse.json({ revalidated: true, type: body._type });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
