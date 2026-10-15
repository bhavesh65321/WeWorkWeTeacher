"use client";

import { useEffect, useState } from "react";
import { Button } from "@wtws/ui";
import { apiClient } from "@/lib/client";
import { formatMoney } from "@/lib/money";

type Overview = {
  users: number;
  jobs: number;
  flags: { id: string; targetType: string; targetId: string; reason: string; status: string }[];
  tickets: { id: string; name: string; email: string; topic: string; body: string; status: string }[];
  payments: {
    id: string;
    userId: string;
    kind: string;
    status: string;
    coins: number | null;
    amountMinor: number;
    currency: string;
    paidAt: string | null;
  }[];
};

type Metrics = {
  generatedAt: string;
  users: {
    total: number;
    students: number;
    tutors: number;
    publishedTutors: number;
    new7d: number;
    new30d: number;
    new30dChangePct: number;
    active7d: number;
    active30d: number;
    premium: number;
    referred: number;
    paying: number;
    conversionPct: number;
  };
  revenue: {
    currency: string;
    totalMinor: number;
    last7dMinor: number;
    last30dMinor: number;
    last30dChangePct: number;
    paidOrders: number;
    paidOrders30d: number;
    paidOrders7d: number;
    avgOrderMinor: number;
  };
  marketplace: {
    jobsTotal: number;
    jobsOpen: number;
    jobs30d: number;
    jobs30dChangePct: number;
    applies30d: number;
    applies30dChangePct: number;
    bookings30d: number;
    conversations30d: number;
    contactUnlocks: number;
  };
  health: { openFlags: number; openTickets: number };
  series: {
    signups30d: { date: string; count: number }[];
    revenue30d: { date: string; count: number; amountMinor: number }[];
    jobs30d: { date: string; count: number }[];
  };
};

function changeLabel(pct: number) {
  if (pct === 0) return "flat vs prior 30d";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}% vs prior 30d`;
}

function changeColor(pct: number) {
  if (pct > 0) return "text-emerald-700";
  if (pct < 0) return "text-rose-700";
  return "text-slate-500";
}

function Kpi({
  label,
  value,
  hint,
  changePct,
}: {
  label: string;
  value: string;
  hint?: string;
  changePct?: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{value}</p>
      {changePct != null ? (
        <p className={`mt-1 text-xs font-medium ${changeColor(changePct)}`}>{changeLabel(changePct)}</p>
      ) : null}
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function MiniBars({
  title,
  points,
  valueOf,
  formatTip,
}: {
  title: string;
  points: { date: string }[];
  valueOf: (p: { date: string } & Record<string, number>) => number;
  formatTip: (p: { date: string } & Record<string, number>) => string;
}) {
  const values = points.map((p) => valueOf(p as { date: string } & Record<string, number>));
  const max = Math.max(...values, 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">Last 30 days</p>
      </div>
      <div className="mt-4 flex h-28 items-end gap-0.5 sm:gap-1">
        {points.map((p, i) => {
          const v = values[i];
          const height = `${Math.max(4, Math.round((v / max) * 100))}%`;
          return (
            <div
              key={p.date}
              className="group relative flex-1 rounded-t bg-sky-500/80 transition hover:bg-sky-600"
              style={{ height }}
              title={formatTip(p as { date: string } & Record<string, number>)}
            />
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-slate-400">
        <span>{points[0]?.date.slice(5)}</span>
        <span>{points[points.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const [overview, growth] = await Promise.all([
      apiClient<Overview>("/admin/overview"),
      apiClient<Metrics>("/admin/metrics"),
    ]);
    setData(overview);
    setMetrics(growth);
  }

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Admin only"));
  }, []);

  if (!data || !metrics) return <p className="text-slate-600">{error || "Loading…"}</p>;

  const currency = metrics.revenue.currency || "INR";

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Admin</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Growth dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          Product snapshot for owners · updated {new Date(metrics.generatedAt).toLocaleString()}
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Total users"
          value={metrics.users.total.toLocaleString()}
          hint={`${metrics.users.students} students · ${metrics.users.publishedTutors} published tutors`}
        />
        <Kpi
          label="Revenue (30d)"
          value={formatMoney(metrics.revenue.last30dMinor, currency)}
          hint={`${metrics.revenue.paidOrders30d} paid orders · ${formatMoney(metrics.revenue.totalMinor, currency)} all-time`}
          changePct={metrics.revenue.last30dChangePct}
        />
        <Kpi
          label="Active users (30d)"
          value={metrics.users.active30d.toLocaleString()}
          hint={`${metrics.users.active7d} active in last 7d · ${metrics.users.conversionPct}% paying`}
        />
        <Kpi
          label="Jobs (30d)"
          value={metrics.marketplace.jobs30d.toLocaleString()}
          hint={`${metrics.marketplace.jobsOpen} open now · ${metrics.marketplace.jobsTotal} total`}
          changePct={metrics.marketplace.jobs30dChangePct}
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="New signups (30d)"
          value={metrics.users.new30d.toLocaleString()}
          hint={`${metrics.users.new7d} in last 7 days`}
          changePct={metrics.users.new30dChangePct}
        />
        <Kpi
          label="Paying users"
          value={metrics.users.paying.toLocaleString()}
          hint={`Avg order ${formatMoney(metrics.revenue.avgOrderMinor, currency)}`}
        />
        <Kpi
          label="Applies (30d)"
          value={metrics.marketplace.applies30d.toLocaleString()}
          hint={`${metrics.marketplace.conversations30d} new chats · ${metrics.marketplace.contactUnlocks} unlocks`}
          changePct={metrics.marketplace.applies30dChangePct}
        />
        <Kpi
          label="Bookings (30d)"
          value={metrics.marketplace.bookings30d.toLocaleString()}
          hint={`${metrics.users.premium} premium · ${metrics.users.referred} referred`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <MiniBars
          title="Daily signups"
          points={metrics.series.signups30d}
          valueOf={(p) => p.count}
          formatTip={(p) => `${p.date}: ${p.count} signups`}
        />
        <MiniBars
          title="Daily revenue"
          points={metrics.series.revenue30d}
          valueOf={(p) => p.amountMinor}
          formatTip={(p) => `${p.date}: ${formatMoney(p.amountMinor, currency)} (${p.count} orders)`}
        />
        <MiniBars
          title="Daily jobs posted"
          points={metrics.series.jobs30d}
          valueOf={(p) => p.count}
          formatTip={(p) => `${p.date}: ${p.count} jobs`}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Ops health</h2>
            <p className="text-sm text-slate-500">
              {metrics.health.openFlags} open flags · {metrics.health.openTickets} open tickets ·{" "}
              {metrics.revenue.paidOrders7d} payments this week
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              await apiClient("/admin/refund-unread", { method: "POST" });
              await load();
            }}
          >
            Process unread coin refunds
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Open flags</h2>
        <ul className="mt-3 space-y-3">
          {data.flags.map((f) => (
            <li key={f.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <p>
                {f.targetType} {f.targetId}
              </p>
              <p className="text-slate-500">{f.reason}</p>
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
        {data.flags.length === 0 ? <p className="mt-3 text-sm text-slate-500">No open flags.</p> : null}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Support tickets</h2>
        <ul className="mt-3 space-y-3">
          {(data.tickets ?? []).map((t) => (
            <li key={t.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <p className="font-semibold">
                {t.topic} · {t.name} · {t.email}
              </p>
              <p className="mt-1 text-slate-500">{t.body}</p>
              <Button
                className="mt-2"
                type="button"
                variant="outline"
                onClick={async () => {
                  await apiClient(`/admin/tickets/${t.id}/close`, {
                    method: "POST",
                    body: JSON.stringify({ note: "Closed" }),
                  });
                  await load();
                }}
              >
                Close
              </Button>
            </li>
          ))}
        </ul>
        {(data.tickets ?? []).length === 0 ? <p className="mt-3 text-sm text-slate-500">No open tickets.</p> : null}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Recent payments</h2>
        <ul className="mt-3 space-y-3">
          {data.payments.map((p) => (
            <li key={p.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <p>
                {p.kind} · {p.status} · {formatMoney(p.amountMinor, p.currency || currency)} · {p.coins ?? 0} coins
              </p>
              <p className="text-slate-500">
                User: {p.userId} · {p.paidAt ? new Date(p.paidAt).toLocaleString() : "Pending"}
              </p>
            </li>
          ))}
        </ul>
        {data.payments.length === 0 ? <p className="mt-3 text-sm text-slate-500">No recent payments.</p> : null}
      </section>
    </div>
  );
}
