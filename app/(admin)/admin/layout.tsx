import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata = { title: "Admin — Lady Fabrics" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const pathname =
    headerList.get("x-invoke-path") ||
    headerList.get("x-pathname") ||
    headerList.get("next-url") ||
    "";

  const isLoginRoute = pathname.includes("/admin/login");

  if (isLoginRoute) {
    return <>{children}</>;
  }

  const guard = await requireAdmin();
  if (!guard.ok) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-paper grid grid-cols-[260px_1fr]">
      <AdminSidebar email={guard.user.email!} role={guard.role} />
      <main className="overflow-x-auto">{children}</main>
    </div>
  );
}

