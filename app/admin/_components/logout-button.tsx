"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function onLogout() {
    setPending(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={pending}
      className="inline-flex items-center rounded-[10px] border border-lk-line bg-transparent px-3.5 py-2 text-helper-text text-lk-ink transition-colors duration-150 hover:bg-lk-surface disabled:opacity-50"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
