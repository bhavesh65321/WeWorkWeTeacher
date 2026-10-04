"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select } from "@wtws/ui";
import { apiClient } from "@/lib/client";
import { AccountControls } from "@/components/account-controls";
import { VerificationStatus } from "@/components/verification-status";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/cards";
import { Icons } from "@/components/ui/icons";
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

  if (!me) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">{error || "Loading…"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Settings"
        badgeColor="slate"
        title="Settings"
        subtitle="Manage your account preferences and profile settings."
      />

      <Section title="Verification" badge={me.emailVerified && me.phoneVerified ? "Verified" : "Pending"} badgeColor={me.emailVerified && me.phoneVerified ? "emerald" : "orange"}>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <VerificationStatus me={me} onVerified={() => router.refresh()} />
        </div>
      </Section>

      <Section title="Profile Information" badge="Edit" badgeColor="blue">
        <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Name</span>
              <Input 
                className="mt-1.5" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                minLength={2} 
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Phone</span>
              <Input 
                className="mt-1.5" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="+1234567890"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">City</span>
              <Input 
                className="mt-1.5" 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
                placeholder="e.g. Mumbai"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Country</span>
              <Input 
                className="mt-1.5" 
                value={country} 
                onChange={(e) => setCountry(e.target.value)} 
                placeholder="e.g. India"
              />
            </label>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Default post visibility</span>
              <Select className="mt-1.5" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                <option value="PUBLIC">Always make public</option>
                <option value="PRIVATE">Private unless I choose public</option>
              </Select>
            </label>
          </div>

          {me.roles.includes("TUTOR") && (
            <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
              <p className="text-sm font-medium text-slate-700">Tutor Settings</p>
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                <input 
                  type="checkbox" 
                  checked={published} 
                  onChange={(e) => setPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[rgb(var(--wtws-blue))]"
                />
                <div>
                  <p className="font-medium text-slate-900">Profile visible in search</p>
                  <p className="text-sm text-slate-500">Uncheck to take a break from receiving inquiries</p>
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                <input 
                  type="checkbox" 
                  checked={notify} 
                  onChange={(e) => setNotify(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[rgb(var(--wtws-blue))]"
                />
                <div>
                  <p className="font-medium text-slate-900">Notify me about matching jobs</p>
                  <p className="text-sm text-slate-500">Get notified when new jobs match your skills</p>
                </div>
              </label>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4 border-t border-slate-100 pt-6">
            <Button type="submit">Save Settings</Button>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {saved && <p className="text-sm text-emerald-600">✓ Settings saved successfully</p>}
          </div>
        </form>
      </Section>

      <Section title="Account" badge="Manage" badgeColor="slate">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <AccountControls />
        </div>
      </Section>
    </div>
  );
}
