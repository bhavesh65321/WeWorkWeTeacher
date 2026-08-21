"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@wtws/ui";
import { apiClient } from "@/lib/client";
import type { Me } from "@/lib/api";

type Sent = { destination: string; via: string; devCode?: string };

export default function VerifyPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [emailCode, setEmailCode] = useState("");
  const [emailSent, setEmailSent] = useState<Sent | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const u = await apiClient<Me>("/auth/me");
    setMe(u);
    if (u.emailVerified) {
      const next = sessionStorage.getItem("wtws_next");
      sessionStorage.removeItem("wtws_next");
      router.replace(next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
      router.refresh();
    }
  }

  useEffect(() => {
    load().catch(() => router.replace("/login"));
  }, [router]);

  async function send() {
    setError("");
    try {
      const res = await apiClient<Sent>("/auth/otp/send", {
        method: "POST",
        body: JSON.stringify({ channel: "EMAIL", purpose: "VERIFY" }),
      });
      setEmailSent(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send");
    }
  }

  async function confirm(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await apiClient("/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify({ channel: "EMAIL", purpose: "VERIFY", code: emailCode }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    }
  }

  if (!me) return <p>Loading…</p>;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Verify your email</h1>
        <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
          Enter the one-time code we sent to {me.email}.
        </p>
      </div>
      <form onSubmit={confirm} className="space-y-3 rounded-2xl border border-[rgb(var(--border))] p-4">
        {emailSent?.devCode ? <p className="text-sm font-semibold">Dev code: {emailSent.devCode}</p> : null}
        <Input required value={emailCode} onChange={(e) => setEmailCode(e.target.value)} placeholder="6-digit code" />
        <Button type="submit" className="w-full">
          Verify email
        </Button>
        <Button type="button" variant="secondary" className="w-full" onClick={send}>
          Resend code
        </Button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
