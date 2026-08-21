"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Textarea } from "@wtws/ui";
import { apiClient } from "@/lib/client";

export function ApplyButton({
  jobId,
  coinPrice,
  alreadyApplied,
  conversationId,
  earlyAccessActive,
  earlyAccessUntil,
}: {
  jobId: string;
  coinPrice: number;
  alreadyApplied: boolean;
  conversationId: string | null;
  earlyAccessActive: boolean;
  earlyAccessUntil?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("Hi — I can help with this. Here is how I would approach the first session.");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (alreadyApplied && conversationId) {
    return (
      <Button type="button" onClick={() => router.push(`/inbox/${conversationId}`)}>
        Open conversation
      </Button>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiClient<{ conversationId: string }>(`/jobs/${jobId}/apply`, {
        method: "POST",
        body: JSON.stringify({ message }),
      });
      router.push(`/inbox/${res.conversationId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not apply");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {earlyAccessActive ? (
        <p className="text-sm text-[rgb(var(--muted-foreground))]">
          Premium early access is on. Free-tier apply unlocks at{" "}
          {earlyAccessUntil ? new Date(earlyAccessUntil).toLocaleTimeString() : "the 1-hour mark"}. Buy Premium in
          Wallet, or wait.
        </p>
      ) : null}
      <Textarea className="min-h-24" value={message} onChange={(e) => setMessage(e.target.value)} minLength={12} required />
      {error ? (
        <p className="text-sm text-red-600">
          {error}
          {error.toLowerCase().includes("not enough coins") ? (
            <>
              {" "}
              <a href="/wallet" className="font-semibold underline">
                Buy coins
              </a>
            </>
          ) : null}
        </p>
      ) : null}
      <Button type="submit" disabled={loading || earlyAccessActive}>
        {loading ? "Applying…" : coinPrice === 0 ? "Apply free" : `Apply · ${coinPrice} coins`}
      </Button>
    </form>
  );
}
