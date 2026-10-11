"use client";

import { useEffect, useState } from "react";
import { Button } from "@wtws/ui";
import { apiClient } from "@/lib/client";

type Overview = {
  users: number;
  jobs: number;
  flags: { id: string; targetType: string; targetId: string; reason: string; status: string }[];
  tickets: { id: string; name: string; email: string; topic: string; body: string; status: string }[];
  payments: { id: string; userId: string; kind: string; status: string; coins: number | null; amountMinor: number; currency: string; paidAt: string | null }[];
};

export default function AdminPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setData(await apiClient<Overview>("/admin/overview"));
  }

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Admin only"));
  }, []);

  if (!data) return <p>{error || "Loading…"}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold">Admin</h1>
      <p className="mt-2 text-[rgb(var(--muted-foreground))]">
        {data.users} users · {data.jobs} jobs · {data.payments.length} recent payments
      </p>
      <Button
        className="mt-4"
        type="button"
        variant="secondary"
        onClick={async () => {
          await apiClient("/admin/refund-unread", { method: "POST" });
          await load();
        }}
      >
        Process unread coin refunds
      </Button>
      <h2 className="mt-8 font-semibold">Open flags</h2>
      <ul className="mt-3 space-y-3">
        {data.flags.map((f) => (
          <li key={f.id} className="rounded-xl border border-[rgb(var(--border))] p-4 text-sm">
            <p>
              {f.targetType} {f.targetId}
            </p>
            <p className="text-[rgb(var(--muted-foreground))]">{f.reason}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {f.targetType === "JOB" ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    await apiClient(`/admin/jobs/${f.targetId}/spam`, { method: "POST" });
                    await apiClient(`/admin/flags/${f.id}/resolve`, { method: "POST" });
                    await load();
                  }}
                >
                  Spam · refund unlocks
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  await apiClient(`/admin/flags/${f.id}/resolve`, { method: "POST" });
                  await load();
                }}
              >
                Resolve
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {data.flags.length === 0 ? <p className="mt-3 text-sm text-[rgb(var(--muted-foreground))]">No open flags.</p> : null}
      <h2 className="mt-8 font-semibold">Support tickets</h2>
      <ul className="mt-3 space-y-3">
        {(data.tickets ?? []).map((t) => (
          <li key={t.id} className="rounded-xl border border-[rgb(var(--border))] p-4 text-sm">
            <p className="font-semibold">
              {t.topic} · {t.name} · {t.email}
            </p>
            <p className="mt-1 text-[rgb(var(--muted-foreground))]">{t.body}</p>
            <Button
              className="mt-2"
              type="button"
              variant="outline"
              onClick={async () => {
                await apiClient(`/admin/tickets/${t.id}/close`, { method: "POST", body: JSON.stringify({ note: "Closed" }) });
                await load();
              }}
            >
              Close
            </Button>
          </li>
        ))}
      </ul>
      {(data.tickets ?? []).length === 0 ? (
        <p className="mt-3 text-sm text-[rgb(var(--muted-foreground))]">No open tickets.</p>
      ) : null}
      <h2 className="mt-8 font-semibold">Recent payments</h2>
      <ul className="mt-3 space-y-3">
        {data.payments.map((p) => (
          <li key={p.id} className="rounded-xl border border-[rgb(var(--border))] p-4 text-sm">
            <p>
              {p.kind} · {p.status} · ₹{(p.amountMinor / 100).toFixed(2)} · {p.coins ?? 0} coins
            </p>
            <p className="text-[rgb(var(--muted-foreground))]">
              User: {p.userId} · {p.paidAt ? new Date(p.paidAt).toLocaleString() : "Pending"}
            </p>
          </li>
        ))}
      </ul>
      {data.payments.length === 0 ? (
        <p className="mt-3 text-sm text-[rgb(var(--muted-foreground))]">No recent payments.</p>
      ) : null}
    </div>
  );
}
