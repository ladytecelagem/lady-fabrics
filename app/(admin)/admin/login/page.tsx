import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Admin Login" };

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="text-display text-2xl mb-2">Lady·Fabrics</div>
        <p className="text-xs uppercase tracking-widest text-stone mb-12">Admin sign in</p>
        <LoginForm />
      </div>
    </div>
  );
}
