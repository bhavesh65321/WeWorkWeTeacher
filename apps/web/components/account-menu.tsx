"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Me } from "@/lib/api";
import { signOut } from "@/lib/sign-out";

export function AccountMenu({ me }: { me: Me }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function onSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="rounded-lg px-2 py-2 text-sm font-semibold hover:bg-[rgb(var(--muted))]"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {me.name.split(" ")[0]}
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-30 min-w-44 rounded-xl border border-[rgb(var(--border))] bg-white py-1 shadow-md">
          <Link href="/dashboard" className="block px-3 py-2 text-sm hover:bg-[rgb(var(--muted))]" onClick={() => setOpen(false)}>
            Dashboard
          </Link>
          <Link href="/settings" className="block px-3 py-2 text-sm hover:bg-[rgb(var(--muted))]" onClick={() => setOpen(false)}>
            Settings
          </Link>
          {me.roles.includes("TUTOR") ? (
            <Link href="/tutors/edit" className="block px-3 py-2 text-sm hover:bg-[rgb(var(--muted))]" onClick={() => setOpen(false)}>
              Teaching profile
            </Link>
          ) : null}
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm hover:bg-[rgb(var(--muted))]"
            onClick={onSignOut}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
