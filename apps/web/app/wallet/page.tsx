"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@wtws/ui";
import { apiClient } from "@/lib/client";
import { formatMoney } from "@/lib/money";
import { PageHeader, StatCard } from "@/components/ui/page-header";
import { Section, ActionCard, InfoCard } from "@/components/ui/cards";
import { Icons } from "@/components/ui/icons";

type Pack = { coins: number; amountMinor: number; label: string };
type Wallet = {
  coinBalance: number;
  fiatMinor: number;
  referralCode: string | null;
  isPremium: boolean;
  premiumUntil: string | null;
  livePayments: boolean;
  entries: { id: string; amount: number; unit: string; type: string; note: string | null; createdAt: string }[];
};

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [live, setLive] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const [w, p] = await Promise.all([
      apiClient<Wallet>("/wallet"),
      apiClient<{ live: boolean; packs: Pack[] }>("/payments/packs"),
    ]);
    setWallet(w);
    setPacks(p.packs);
    setLive(p.live);
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (sessionId) {
      await apiClient(`/payments/confirm?session_id=${sessionId}`);
      window.history.replaceState({}, "", "/wallet");
      setWallet(await apiClient<Wallet>("/wallet"));
    }
  }

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Log in first"));
  }, []);

  if (!wallet) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">{error || "Loading…"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Wallet"
        badgeColor="emerald"
        title="Wallet"
        subtitle={
          <>
            Coins never expire. {live ? "Card payments via Stripe." : "Sandbox mode — add STRIPE_SECRET_KEY for live cards."}
          </>
        }
      >
        <StatCard
          icon={<span className="text-emerald-600">{Icons.coin}</span>}
          label={`${wallet.coinBalance} coins`}
          sublabel="Available balance"
          badge="Available"
          badgeColor="emerald"
          gradient
        />
        <StatCard
          icon={<span className="text-blue-600">{Icons.wallet}</span>}
          label={formatMoney(wallet.fiatMinor)}
          sublabel="Tutor payout balance"
          badge={wallet.fiatMinor > 0 ? "Pending" : "Empty"}
          badgeColor={wallet.fiatMinor > 0 ? "orange" : "slate"}
        />
      </PageHeader>

      <Section title="Buy Coins" badge="Top up" badgeColor="blue">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {packs.map((pack) => (
            <div key={pack.coins} className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <span className="text-2xl">🪙</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{pack.coins}</p>
              <p className="text-sm text-slate-500">{pack.label}</p>
              <Button
                type="button"
                className="mt-4 w-full"
                onClick={async () => {
                  const res = await apiClient<{ mode: string; url?: string }>(`/payments/checkout/coins`, {
                    method: "POST",
                    body: JSON.stringify({ coins: pack.coins }),
                  });
                  if (res.url) window.location.href = res.url;
                  else await load();
                }}
              >
                ${(pack.amountMinor / 100).toFixed(0)}
              </Button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Premium" badge={wallet.isPremium ? "Active" : "Upgrade"} badgeColor={wallet.isPremium ? "emerald" : "orange"}>
        <div className="grid gap-4 lg:grid-cols-2">
          <ActionCard
            icon={Icons.bolt}
            title="Premium Access"
            description="See new student job posts 1 hour before standard listing. Get priority in search results."
            href="#"
            buttonText={wallet.isPremium ? "✓ Premium Active" : "Upgrade · 100 coins"}
            buttonVariant={wallet.isPremium ? "success" : "premium"}
          />
          <InfoCard
            icon={<span className="text-blue-500">{Icons.users}</span>}
            title="Invite friends"
            description="Both of you get free coin bonuses on registration."
            badge="+20 Coins"
            badgeColor="emerald"
          >
            {wallet.referralCode && (
              <div className="mt-3">
                <p className="text-[10px] font-medium uppercase text-slate-400">Your referral code</p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="rounded bg-slate-100 px-2 py-1 text-sm font-mono text-slate-700">
                    {wallet.referralCode}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(wallet.referralCode || "")}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {Icons.copy}
                    Copy
                  </button>
                </div>
              </div>
            )}
          </InfoCard>
        </div>
      </Section>

      <Section title="Transaction History" badge={`${wallet.entries.length} entries`} badgeColor="slate">
        <div className="rounded-2xl border border-slate-200 bg-white">
          {wallet.entries.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No transactions yet</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {wallet.entries.map((e) => (
                <li key={e.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="font-medium text-slate-900">{e.type}</p>
                    {e.note && <p className="text-sm text-slate-500">{e.note}</p>}
                  </div>
                  <span className={`font-semibold ${e.amount > 0 ? "text-emerald-600" : "text-slate-900"}`}>
                    {e.amount > 0 ? "+" : ""}
                    {e.amount} {e.unit === "COIN" ? "coins" : "¢"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="mt-4 text-center text-sm">
          <Link href="/refunds" className="font-semibold text-[rgb(var(--wtws-blue))] hover:underline">
            View refund policy →
          </Link>
        </p>
      </Section>
    </div>
  );
}
