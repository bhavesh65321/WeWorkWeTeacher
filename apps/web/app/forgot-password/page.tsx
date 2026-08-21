"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button, Input } from "@wtws/ui";
import { apiClient } from "@/lib/client";

type Sent = { destination: string; via: string; devCode?: string };

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState<Sent | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiClient<Sent>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSent(res);
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code");
    } finally {
      setLoading(false);
    }
  }

  async function reset(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiClient("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, code, password }),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold">Reset password</h1>
      {done ? (
        <p className="mt-4 text-sm">
          Password updated.{" "}
          <Link href="/login" className="font-semibold text-[rgb(var(--wtws-blue))]">
            Log in
          </Link>
        </p>
      ) : step === "email" ? (
        <form onSubmit={sendCode} className="mt-6 space-y-4">
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Enter your email. If an account exists, we send a one-time code.
          </p>
          <label className="block text-sm font-medium">
            Email
            <Input className="mt-1" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={reset} className="mt-6 space-y-4">
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Enter the code sent to {sent?.destination ?? "your email"} and choose a new password.
          </p>
          {sent?.devCode ? <p className="text-sm font-semibold">Dev code: {sent.devCode}</p> : null}
          <label className="block text-sm font-medium">
            Code
            <Input className="mt-1" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" />
          </label>
          <label className="block text-sm font-medium">
            New password
            <Input
              className="mt-1"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : "Update password"}
          </Button>
        </form>
      )}
      <p className="mt-6 text-sm">
        <Link href="/login" className="font-semibold text-[rgb(var(--wtws-blue))]">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
