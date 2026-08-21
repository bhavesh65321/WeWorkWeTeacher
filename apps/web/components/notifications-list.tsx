"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/client";
import { timeAgo } from "@/lib/time";

type Item = { id: string; title: string; body: string; href: string | null; readAt: string | null; createdAt: string };

export function NotificationsList() {
  const params = useSearchParams();
  const filter = (params.get("filter") as "unread" | "read" | null) ?? undefined;
  const [items, setItems] = useState<Item[]>([]);

  async function load() {
    const qs = filter ? `?filter=${filter}` : "";
    setItems(await apiClient<Item[]>(`/notifications${qs}`));
  }

  useEffect(() => {
    load().catch(() => setItems([]));
  }, [filter]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">Notifications</h1>
      <div className="mt-4 flex gap-3 text-sm">
        <Link href="/notifications" className={!filter ? "font-semibold text-[rgb(var(--wtws-blue))]" : ""}>
          All
        </Link>
        <Link href="/notifications?filter=unread" className={filter === "unread" ? "font-semibold text-[rgb(var(--wtws-blue))]" : ""}>
          Unread
        </Link>
        <Link href="/notifications?filter=read" className={filter === "read" ? "font-semibold text-[rgb(var(--wtws-blue))]" : ""}>
          Read
        </Link>
        <button
          type="button"
          className="ml-auto font-semibold text-[rgb(var(--wtws-blue))]"
          onClick={async () => {
            await apiClient("/notifications/read", { method: "POST" });
            await load();
          }}
        >
          Mark all read
        </button>
      </div>
      <ul className="mt-6 space-y-2">
        {items.map((n) => (
          <li key={n.id}>
            <Link
              href={n.href || "/dashboard"}
              className={`block rounded-2xl px-4 py-3 ${n.readAt ? "bg-[rgb(var(--muted))]" : "bg-[#eef4ff]"}`}
              onClick={() => apiClient(`/notifications/${n.id}/read`, { method: "POST" }).catch(() => undefined)}
            >
              <div className="flex justify-between gap-3">
                <p className="font-semibold">{n.title}</p>
                <p className="shrink-0 text-xs text-[rgb(var(--muted-foreground))]">{timeAgo(n.createdAt)}</p>
              </div>
              <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">{n.body}</p>
            </Link>
          </li>
        ))}
      </ul>
      {items.length === 0 ? <p className="mt-6 text-sm text-[rgb(var(--muted-foreground))]">No notifications.</p> : null}
    </div>
  );
}
