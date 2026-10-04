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

  const unreadCount = items.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex gap-2">
          <Link
            href="/notifications"
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              !filter
                ? "border border-[rgb(var(--wtws-blue))] bg-blue-50 text-[rgb(var(--wtws-blue))]"
                : "border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            All
          </Link>
          <Link
            href="/notifications?filter=unread"
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === "unread"
                ? "border border-[rgb(var(--wtws-blue))] bg-blue-50 text-[rgb(var(--wtws-blue))]"
                : "border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </Link>
          <Link
            href="/notifications?filter=read"
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === "read"
                ? "border border-[rgb(var(--wtws-blue))] bg-blue-50 text-[rgb(var(--wtws-blue))]"
                : "border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            Read
          </Link>
        </div>
        <button
          type="button"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          onClick={async () => {
            await apiClient("/notifications/read", { method: "POST" });
            await load();
          }}
        >
          Mark all read
        </button>
      </div>

      {items.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
          {items.map((n) => (
            <Link
              key={n.id}
              href={n.href || "/dashboard"}
              className={`flex items-start gap-4 px-5 py-4 transition hover:bg-slate-50 ${!n.readAt ? "bg-blue-50/50" : ""}`}
              onClick={() => apiClient(`/notifications/${n.id}/read`, { method: "POST" }).catch(() => undefined)}
            >
              <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${!n.readAt ? "bg-blue-100" : "bg-slate-100"}`}>
                <svg className={`h-4 w-4 ${!n.readAt ? "text-blue-600" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <p className={`font-semibold ${!n.readAt ? "text-slate-900" : "text-slate-700"}`}>{n.title}</p>
                  <p className="shrink-0 text-xs text-slate-500">{timeAgo(n.createdAt)}</p>
                </div>
                <p className="mt-1 text-sm text-slate-500">{n.body}</p>
              </div>
              {!n.readAt && (
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-900">No notifications</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            You're all caught up! New notifications will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
