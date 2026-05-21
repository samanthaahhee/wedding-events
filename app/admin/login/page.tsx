"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";

  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Wrong password");
        setSubmitting(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col justify-center px-6 py-16 sm:px-12">
      <h1 className="text-section-title text-lk-ink">Admin</h1>
      <p className="text-section-subtitle text-lk-ink-muted mt-2">
        Enter the password to view survey responses.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-3">
        <label className="text-helper-text text-lk-ink-muted" htmlFor="pw">
          Password
        </label>
        <input
          id="pw"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="min-h-[52px] w-full rounded-[12px] border border-lk-line bg-lk-surface px-5 py-3.5 text-body text-lk-ink outline-none transition-[border-color,box-shadow] duration-150 hover:border-lk-ink focus:border-lk-accent focus:[box-shadow:var(--lk-shadow-focus)]"
        />
        {error && (
          <p className="text-helper-text text-lk-accent">↳ {error}</p>
        )}
        <button
          type="submit"
          disabled={submitting || password.length === 0}
          className="mt-3 inline-flex items-center justify-center rounded-[12px] bg-lk-accent px-7 py-4 text-button-label text-white transition-[background-color] duration-150 hover:bg-lk-accent-pressed disabled:cursor-not-allowed disabled:bg-lk-ink-subtle"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
