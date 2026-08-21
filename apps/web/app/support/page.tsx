"use client";

import { FormEvent, useState } from "react";
import { Button, Input, Select, Textarea } from "@wtws/ui";
import { apiClient } from "@/lib/client";

export default function SupportPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    try {
      await apiClient("/support", {
        method: "POST",
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          topic: data.get("topic"),
          body: data.get("body"),
        }),
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="text-3xl font-bold">Support</h1>
        <p className="mt-4">Thanks. We will reply by email.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-3xl font-bold">Support</h1>
      <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
        Payments, disputes, coins, or account help. Admins see tickets in the admin queue.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm font-medium">
          Name
          <Input className="mt-1" name="name" required />
        </label>
        <label className="block text-sm font-medium">
          Email
          <Input className="mt-1" name="email" type="email" required />
        </label>
        <label className="block text-sm font-medium">
          Topic
          <Select className="mt-1" name="topic" required defaultValue="payments">
            <option value="payments">Payments / coins</option>
            <option value="dispute">Session dispute</option>
            <option value="account">Account</option>
            <option value="other">Other</option>
          </Select>
        </label>
        <label className="block text-sm font-medium">
          Details
          <Textarea className="mt-1 min-h-28" name="body" required minLength={10} />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Sending…" : "Send"}
        </Button>
      </form>
    </div>
  );
}
