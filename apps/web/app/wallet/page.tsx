"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card } from "@wtws/ui";
import { apiClient } from "@/lib/client";
import { formatMoney } from "@/lib/money";

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

  if (!wallet) return <p>{error || "Loading…"}</p>;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold">Wallet</h1>
      <p className="mt-2 text-[rgb(var(--muted-foreground))]">
        Coins never expire. {live ? "Card payments via Stripe." : "Sandbox mode — add STRIPE_SECRET_KEY for live cards."}
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Coins</p>
          <p className="mt-1 text-3xl font-bold">{wallet.coinBalance}</p>
        </Card>
        <Card>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Tutor payout balance</p>
          <p className="mt-1 text-3xl font-bold">{formatMoney(wallet.fiatMinor)}</p>
        </Card>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {packs.map((pack) => (
          <Button
            key={pack.coins}
            type="button"
            variant="secondary"
            onClick={async () => {
              const res = await apiClient<{ mode: string; url?: string }>(`/payments/checkout/coins`, {
                method: "POST",
                body: JSON.stringify({ coins: pack.coins }),
              });
              if (res.url) window.location.href = res.url;
              else await load();
            }}
          >
            {pack.label} · {pack.coins} coins · ${(pack.amountMinor / 100).toFixed(0)}
          </Button>
        ))}
        <Button
          type="button"
          variant={wallet.isPremium ? "outline" : "primary"}
          disabled={wallet.isPremium}
          onClick={async () => {
            await apiClient("/wallet/premium", { method: "POST" });
            await load();
          }}
        >
          {wallet.isPremium ? "Premium active" : "Premium · 100 coins"}
        </Button>
      </div>
      {wallet.referralCode ? (
        <p className="mt-4 text-sm">
          Referral code: <span className="font-semibold">{wallet.referralCode}</span>
        </p>
      ) : null}
      <p className="mt-4 text-sm">
        <Link href="/refunds" className="font-semibold text-[rgb(var(--wtws-blue))]">
          Refund policy
        </Link>
      </p>
      <h2 className="mt-8 font-semibold">Ledger</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {wallet.entries.map((e) => (
          <li key={e.id} className="flex justify-between gap-4 border-b border-[rgb(var(--border))] pb-2">
            <span>
              {e.type}
              {e.note ? ` · ${e.note}` : ""}
            </span>
            <span className="font-semibold">
              {e.amount > 0 ? "+" : ""}
              {e.amount} {e.unit === "COIN" ? "c" : "¢"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
