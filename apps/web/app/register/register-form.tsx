"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@wtws/ui";
import { apiClient } from "@/lib/client";
import { persistSession } from "@/lib/session";
import { track } from "@/lib/analytics";
import { GoogleButton } from "@/components/google-button";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [referral, setReferral] = useState("");
  const [asTutor, setAsTutor] = useState(false);
  const [next, setNext] = useState<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setReferral(q.get("ref") ?? "");
    setAsTutor(q.get("as") === "tutor");
    const n = q.get("next");
    if (n?.startsWith("/") && !n.startsWith("//")) {
      setNext(n);
      sessionStorage.setItem("wtws_next", n);
    }
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    try {
      const created = await apiClient<{ token: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          password: data.get("password"),
          dateOfBirth: data.get("dateOfBirth"),
          referralCode: data.get("referralCode") || undefined,
        }),
      });
      await persistSession(created.token);
      track("signup_completed", { activeRole: asTutor ? "TUTOR" : "STUDENT" });
      if (asTutor) {
        await apiClient("/auth/enable-tutor", { method: "POST" });
        await apiClient("/auth/role", { method: "POST", body: JSON.stringify({ role: "TUTOR" }) });
      }
      router.push("/verify");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold">Sign up</h1>
      <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
        Continue with Google, or create an account with email. We send a one-time code to verify new email signups.
      </p>
      <div className="mt-6">
        <GoogleButton label="Continue with Google" next={next} asTutor={asTutor} />
      </div>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setAsTutor(false)}
            className={`rounded-lg py-2 ${!asTutor ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
          >
            I&apos;m a student
          </button>
          <button
            type="button"
            onClick={() => setAsTutor(true)}
            className={`rounded-lg py-2 ${asTutor ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
          >
            I&apos;m a tutor
          </button>
        </div>
        <label className="block text-sm font-medium">
          Full name
          <Input className="mt-1" name="name" autoComplete="name" required minLength={2} />
        </label>
        <label className="block text-sm font-medium">
          Email
          <Input className="mt-1" name="email" type="email" autoComplete="email" required />
        </label>
        <label className="block text-sm font-medium">
          Password
          <Input className="mt-1" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </label>
        <label className="block text-sm font-medium">
          Date of birth
          <Input className="mt-1" name="dateOfBirth" type="date" required />
        </label>
        <label className="block text-sm font-medium">
          Referral code (optional)
          <Input className="mt-1" name="referralCode" value={referral} onChange={(e) => setReferral(e.target.value)} />
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="terms" required className="mt-1" />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="font-semibold text-[rgb(var(--wtws-blue))]">
              Terms
            </Link>
            ,{" "}
            <Link href="/privacy" className="font-semibold text-[rgb(var(--wtws-blue))]">
              Privacy
            </Link>
            , and{" "}
            <Link href="/refunds" className="font-semibold text-[rgb(var(--wtws-blue))]">
              Refunds
            </Link>
            . I am 13 or older.
          </span>
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating…" : asTutor ? "Sign up as tutor" : "Sign up free"}
        </Button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-semibold text-[rgb(var(--wtws-blue))]">
          Log in
        </Link>
      </p>
    </div>
  );
}
