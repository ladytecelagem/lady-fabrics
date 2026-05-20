import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata = { title: "Admin — Lady Fabrics" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const guard = await requireAdmin();
  if (!guard.ok) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-paper grid grid-cols-[260px_1fr]">
      <AdminSidebar email={guard.user.email!} role={guard.role} />
      <main className="overflow-x-auto">{children}</main>
    </div>
  );
}
