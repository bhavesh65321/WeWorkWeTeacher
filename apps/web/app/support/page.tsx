"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
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
      <div className="space-y-8">
        <div>
          <span className="inline-block rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Ticket Submitted
          </span>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Thank you!</h1>
          <p className="mt-2 text-slate-600">
            We've received your support request and will reply by email within 24-48 hours.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-7 w-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-semibold text-emerald-900">Ticket submitted successfully</h3>
          <p className="mt-1 text-sm text-emerald-700">Check your email for updates on your request.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl bg-[rgb(var(--wtws-blue))] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[rgb(var(--wtws-blue-dark))]"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/support"
            onClick={() => setSent(false)}
            className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Submit Another Ticket
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          Support
        </span>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Get help</h1>
        <p className="mt-2 text-slate-600">
          Payments, disputes, coins, or account help. Our team typically responds within 24-48 hours.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Submit a ticket</h2>
            <p className="mt-1 text-sm text-slate-500">Fill out the form below and we'll get back to you.</p>
            
            <form onSubmit={onSubmit} className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Name</span>
                  <Input className="mt-1.5" name="name" required placeholder="Your name" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <Input className="mt-1.5" name="email" type="email" required placeholder="you@example.com" />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Topic</span>
                <Select className="mt-1.5" name="topic" required defaultValue="payments">
                  <option value="payments">Payments / coins</option>
                  <option value="dispute">Session dispute</option>
                  <option value="account">Account</option>
                  <option value="other">Other</option>
                </Select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Details</span>
                <Textarea 
                  className="mt-1.5 min-h-32" 
                  name="body" 
                  required 
                  minLength={10} 
                  placeholder="Please describe your issue in detail..."
                />
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? "Sending…" : "Submit Ticket"}
              </Button>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-3 font-semibold text-slate-900">FAQ</h3>
            <p className="mt-1 text-sm text-slate-500">Check our frequently asked questions for quick answers.</p>
            <Link href="/faq" className="mt-3 inline-block text-sm font-semibold text-[rgb(var(--wtws-blue))] hover:underline">
              View FAQ →
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="mt-3 font-semibold text-slate-900">Email us</h3>
            <p className="mt-1 text-sm text-slate-500">Prefer email? Reach us directly.</p>
            <a href="mailto:support@gurumates.com" className="mt-3 inline-block text-sm font-semibold text-[rgb(var(--wtws-blue))] hover:underline">
              support@gurumates.com
            </a>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-3 font-semibold text-slate-900">Response time</h3>
            <p className="mt-1 text-sm text-slate-500">We typically respond within 24-48 hours on business days.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
