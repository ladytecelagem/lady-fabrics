import { NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { allCollectionsQuery } from "@/sanity/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const env = {
    projectId,
    dataset,
    apiVersion,
    hasReadToken: !!process.env.SANITY_API_READ_TOKEN,
    hasWriteToken: !!process.env.SANITY_API_WRITE_TOKEN,
  };

  const raw = createClient({ projectId, dataset, apiVersion, useCdn: false });

  const out: any = { env };

  try {
    out.countAll = await raw.fetch(`count(*[_type == "collection"])`);
  } catch (e: any) {
    out.countAllError = `${e.statusCode ?? ""} ${e.message}`;
  }

  try {
    out.idsAll = await raw.fetch(`*[_type == "collection"]{_id, title, "slug": slug.current, order}`);
  } catch (e: any) {
    out.idsAllError = `${e.statusCode ?? ""} ${e.message}`;
  }

  try {
    out.appQuery = await raw.fetch(allCollectionsQuery);
  } catch (e: any) {
    out.appQueryError = `${e.statusCode ?? ""} ${e.message}`;
  }

  return NextResponse.json(out, { headers: { "cache-control": "no-store" } });
}
