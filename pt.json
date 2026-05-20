import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { ok: false as const, reason: "no-session" };

  const { data: profile } = await sb.from("profiles")
    .select("role").eq("id", user.id).maybeSingle();

  const allowed = ["superadmin", "admin", "editor"];
  if (!profile || !allowed.includes(profile.role)) {
    return { ok: false as const, reason: "forbidden" };
  }
  return { ok: true as const, user, role: profile.role };
}

export async function requireSuperAdmin() {
  const g = await requireAdmin();
  if (!g.ok) return g;
  if (g.role !== "superadmin" && g.role !== "admin") return { ok: false as const, reason: "forbidden" };
  return g;
}
