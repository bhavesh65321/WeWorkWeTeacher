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
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        badge="Wallet"
        badgeColor="emerald"
        title="Wallet"
        subtitle={
          <>
            Coins never expire. {live ? "Card payments via Stripe." : "Sandbox mode — instant coins."}
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
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {packs.map((pack) => (
            <div key={pack.coins} className="rounded-xl border border-slate-200 bg-white p-3 text-center sm:rounded-2xl sm:p-5">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 sm:mb-3 sm:h-12 sm:w-12">
                <span className="text-xl sm:text-2xl">🪙</span>
              </div>
              <p className="text-xl font-bold text-slate-900 sm:text-2xl">{pack.coins}</p>
              <p className="text-xs text-slate-500 sm:text-sm">{pack.label}</p>
              <Button
                type="button"
                className="mt-3 w-full text-xs sm:mt-4 sm:text-sm"
                onClick={async () => {
                  const res = await apiClient<{ mode: string; url?: string }>(`/payments/checkout/coins`, {
                    method: "POST",
                    body: JSON.stringify({ coins: pack.coins }),
                  });
                  if (res.url) window.location.href = res.url;
                  else await load();
                }}
              >
                ₹{(pack.amountMinor / 100).toFixed(0)}
              </Button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Premium" badge={wallet.isPremium ? "Active" : "Upgrade"} badgeColor={wallet.isPremium ? "emerald" : "orange"}>
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
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
              <div className="mt-2 sm:mt-3">
                <p className="text-[9px] font-medium uppercase text-slate-400 sm:text-[10px]">Your referral code</p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="rounded bg-slate-100 px-2 py-1 text-xs font-mono text-slate-700 sm:text-sm">
                    {wallet.referralCode}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(wallet.referralCode || "")}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:px-3 sm:py-1.5 sm:text-sm"
                  >
                    {Icons.copy}
                    <span className="hidden sm:inline">Copy</span>
                  </button>
                </div>
              </div>
            )}
          </InfoCard>
        </div>
      </Section>

      <Section title="Transaction History" badge={`${wallet.entries.length} entries`} badgeColor="slate">
        <div className="rounded-xl border border-slate-200 bg-white sm:rounded-2xl">
          {wallet.entries.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500 sm:p-8">No transactions yet</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {wallet.entries.map((e) => (
                <li key={e.id} className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 sm:text-base">{e.type}</p>
                    {e.note && <p className="truncate text-xs text-slate-500 sm:text-sm">{e.note}</p>}
                  </div>
                  <span className={`ml-3 shrink-0 text-sm font-semibold sm:text-base ${e.amount > 0 ? "text-emerald-600" : "text-slate-900"}`}>
                    {e.amount > 0 ? "+" : ""}
                    {e.amount} {e.unit === "COIN" ? "coins" : "¢"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="mt-3 text-center text-xs sm:mt-4 sm:text-sm">
          <Link href="/refunds" className="font-semibold text-[rgb(var(--wtws-blue))] hover:underline">
            View refund policy →
          </Link>
        </p>
      </Section>
    </div>
  );
}
