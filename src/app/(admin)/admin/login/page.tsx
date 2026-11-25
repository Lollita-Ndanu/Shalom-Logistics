"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Invalid login credentials.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--admin-page)] px-4 py-10 text-[var(--admin-ink)]">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-5 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-8 shadow-xl"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--admin-green)]">Shalom Logistics</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Admin Panel</h1>
          <p className="mt-1 text-sm text-[var(--admin-muted)]">
            Sign in with your owner credentials to manage site content and quotes.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-[var(--admin-ink)]">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[var(--admin-border)] bg-white px-3.5 py-2.5 text-sm text-[var(--admin-ink)] focus:border-[var(--admin-green)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-green)]/20"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-[var(--admin-ink)]">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[var(--admin-border)] bg-white px-3.5 py-2.5 text-sm text-[var(--admin-ink)] focus:border-[var(--admin-green)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-green)]/20"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[var(--admin-gold)] px-4 py-2.5 text-sm font-semibold text-[var(--admin-ink)] transition hover:bg-[var(--admin-gold-light)] disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </main>
  );
}
