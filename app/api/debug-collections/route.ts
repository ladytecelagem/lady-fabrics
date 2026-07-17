import { NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  const out: any = {
    env: { projectId, dataset, apiVersion, hasReadToken: !!process.env.SANITY_API_READ_TOKEN, hasWriteToken: !!token },
    datasets: {},
  };

  let names: string[] = [];
  try {
    const res = await fetch(`https://api.sanity.io/v2021-06-07/projects/${projectId}/datasets`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });
    const list = await res.json();
    names = Array.isArray(list) ? list.map((d: any) => d.name) : [];
    out.datasetList = names.length ? names : list;
  } catch (e: any) {
    out.datasetListError = e.message;
  }

  for (const name of names) {
    const c = createClient({ projectId, dataset: name, apiVersion, useCdn: false, token });
    try {
      out.datasets[name] = await c.fetch(
        `*[_type == "collection"]{_id, title, "slug": slug.current}`
      );
    } catch (e: any) {
      out.datasets[name] = `ERROR ${e.statusCode ?? ""} ${e.message}`;
    }
  }

  return NextResponse.json(out, { headers: { "cache-control": "no-store" } });
}
