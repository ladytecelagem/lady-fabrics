import { createClient } from "@supabase/supabase-js";

// Public read-only client for site content (pages, collections, fabrics, ...).
// Uses the anon key + public RLS SELECT policies. No cookies, safe to cache.
// Singleton per server instance.
let _read: ReturnType<typeof createClient> | undefined;

export function readClient() {
  if (_read) return _read;
  _read = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
  return _read;
}

// Brand scope: every content query is filtered to Lady Fabrics.
export const BRAND_SLUG = "lady-fabrics";

let _brandId: string | null | undefined;
export async function brandId(): Promise<string | null> {
  if (_brandId !== undefined) return _brandId;
  const { data } = await readClient()
    .from("brands").select("id").eq("slug", BRAND_SLUG).single();
  _brandId = (data as any)?.id ?? null;
  return _brandId ?? null;
}
