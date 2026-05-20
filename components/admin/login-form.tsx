"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr("");
    const sb = createClient();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) { setErr(error.message); setLoading(false); return; }
    router.push("/admin");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label className="text-xs uppercase tracking-widest text-stone">Email</label>
        <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="text-xs uppercase tracking-widest text-stone">Password</label>
        <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Signing in…" : "Sign in"}
      </Button>
      {err && <p className="text-xs text-red-700">{err}</p>}
    </form>
  );
}
