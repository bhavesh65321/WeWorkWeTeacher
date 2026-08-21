"use client";

import { FormEvent, useState } from "react";
import { Button, Input } from "@wtws/ui";
import { apiClient } from "@/lib/client";

export function PhoneSettings({ phone }: { phone: string | null }) {
  const [value, setValue] = useState(phone ?? "");
  const [saved, setSaved] = useState(phone);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const me = await apiClient<{ phone: string | null }>("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ phone: value }),
      });
      setSaved(me.phone);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save phone");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-md rounded-2xl border border-[rgb(var(--border))] p-4">
      <h2 className="font-semibold">Your phone</h2>
      <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
        Shared only after the student pays. The other person can then chat here or open WhatsApp.
      </p>
      <label className="mt-3 block text-sm font-medium">
        Mobile with country code
        <Input
          className="mt-1"
          type="tel"
          required
          minLength={10}
          placeholder="+919876543210"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      {saved && !error ? (
        <p className="mt-2 text-sm text-[rgb(var(--wtws-teal))]">Saved as {saved}</p>
      ) : null}
      <Button type="submit" className="mt-3" disabled={loading}>
        {loading ? "Saving…" : "Save phone"}
      </Button>
    </form>
  );
}
