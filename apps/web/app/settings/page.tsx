"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select } from "@wtws/ui";
import { apiClient } from "@/lib/client";
import { AccountControls } from "@/components/account-controls";
import type { Me } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [published, setPublished] = useState(true);
  const [notify, setNotify] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiClient<Me>("/auth/me")
      .then((u) => {
        setMe(u);
        setName(u.name);
        setPhone(u.phone ?? "");
        setCity(u.city ?? "");
        setCountry(u.country ?? "");
        setVisibility(u.defaultVisibility ?? "PUBLIC");
        setPublished(u.tutorPublished !== false);
        setNotify(u.notifyMatching !== false);
      })
      .catch(() => setError("Log in first"));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    try {
      await apiClient("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name,
          city,
          country,
          defaultVisibility: visibility,
          ...(phone.trim().length >= 10 ? { phone } : {}),
        }),
      });
      if (me?.roles.includes("TUTOR")) {
        await apiClient("/tutors/me", {
          method: "PATCH",
          body: JSON.stringify({ isPublished: published, notifyMatching: notify }),
        });
      }
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
  }

  if (!me) return <p>{error || "Loading…"}</p>;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
        {me.email} · {me.emailVerified ? "email verified" : "email not verified"} ·{" "}
        {me.phoneVerified ? "phone verified" : "phone not verified"}
      </p>
      {!me.emailVerified ? (
        <a href="/verify" className="mt-2 inline-block text-sm font-semibold text-[rgb(var(--wtws-blue))]">
          Verify your email
        </a>
      ) : null}
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm font-medium">
          Name
          <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
        </label>
        <label className="block text-sm font-medium">
          Phone
          <Input className="mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+919876543210" />
        </label>
        <label className="block text-sm font-medium">
          City
          <Input className="mt-1" value={city} onChange={(e) => setCity(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          Country
          <Input className="mt-1" value={country} onChange={(e) => setCountry(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          New posts visibility
          <Select className="mt-1" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
            <option value="PUBLIC">Always make public</option>
            <option value="PRIVATE">Private unless I choose public</option>
          </Select>
        </label>
        {me.roles.includes("TUTOR") ? (
          <>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
              Profile visible in search (uncheck to take a break)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
              Notify me about matching jobs
            </label>
          </>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {saved ? <p className="text-sm text-[rgb(var(--wtws-teal))]">Saved.</p> : null}
        <Button type="submit">Save settings</Button>
      </form>
      <AccountControls />
    </div>
  );
}
