"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Layers, BookOpen, Newspaper, TrendingUp, Building2, Image, Settings, Users, LogOut, Compass, Palette } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";

const items = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/collections", icon: Layers, label: "Collections" },
  { href: "/admin/fabrics", icon: Palette, label: "Fabrics" },
  { href: "/admin/sample-books", icon: BookOpen, label: "Sample Books" },
  { href: "/admin/industries", icon: Building2, label: "Industries" },
  { href: "/admin/news", icon: Newspaper, label: "News" },
  { href: "/admin/trends", icon: TrendingUp, label: "Trends" },
  { href: "/admin/media", icon: Image, label: "Media" },
  { href: "/admin/seo", icon: Compass, label: "SEO" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function AdminSidebar({ email, role }: { email: string; role: string }) {
  const path = usePathname();
  const logout = async () => {
    const sb = createClient();
    await sb.auth.signOut();
    location.href = "/admin/login";
  };

  return (
    <aside className="border-r border-ink/10 h-screen sticky top-0 flex flex-col">
      <div className="px-6 py-6 border-b border-ink/10">
        <Link href="/admin" className="text-display text-xl">Lady·Fabrics</Link>
        <p className="text-[10px] uppercase tracking-widest text-stone mt-1">Admin</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(it => {
          const active = path === it.href || (it.href !== "/admin" && path.startsWith(it.href));
          return (
            <Link key={it.href} href={it.href}
              className={cn("flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
                active ? "bg-ink text-bone" : "text-ink/70 hover:bg-ink/5 hover:text-ink")}>
              <it.icon className="w-4 h-4" />{it.label}
            </Link>
          );
        })}
        <a href="/studio" target="_blank" rel="noopener"
          className="flex items-center gap-3 px-3 py-2 rounded text-sm text-ink/70 hover:bg-ink/5 transition-colors">
          <Layers className="w-4 h-4" />Open Sanity Studio ↗
        </a>
      </nav>

      <div className="px-3 py-4 border-t border-ink/10 text-xs">
        <p className="px-3 truncate">{email}</p>
        <p className="px-3 text-stone uppercase tracking-widest mt-1">{role}</p>
        <button onClick={logout} className="mt-3 w-full flex items-center gap-2 px-3 py-2 rounded text-ink/70 hover:bg-ink/5">
          <LogOut className="w-4 h-4" />Sign out
        </button>
      </div>
    </aside>
  );
}
