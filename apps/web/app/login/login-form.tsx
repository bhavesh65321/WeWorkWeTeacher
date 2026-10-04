"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@wtws/ui";
import { apiClient } from "@/lib/client";
import { persistSession, afterAuthPath } from "@/lib/session";
import { GoogleButton } from "@/components/google-button";
import type { Me } from "@/lib/api";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const next = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null;
  const googleHint =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("google") : null;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    try {
      const res = await apiClient<{ token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: data.get("email"),
          password: data.get("password"),
        }),
      });
      
      // Store token in localStorage
      await persistSession(res.token);
      
      if (next?.startsWith("/")) sessionStorage.setItem("wtws_next", next);
      
      // Get user info with the token we just received
      const meRes = await fetch(`/api/auth/me`, {
        headers: {
          "Authorization": `Bearer ${res.token}`,
        },
      });
      
      if (!meRes.ok) {
        throw new Error("Failed to get user info");
      }
      
      const me = await meRes.json() as Me;
      const redirectPath = afterAuthPath({ needsVerify: !me.emailVerified, next });
      router.push(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold">Log in</h1>
      <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
        Continue with Google, or use the email and password you signed up with.
      </p>
      {googleHint === "denied" || googleHint === "failed" ? (
        <p className="mt-3 text-sm text-red-600">Google sign-in was cancelled or failed. Try again.</p>
      ) : null}

      <div className="mt-6">
        <GoogleButton next={next} />
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium">
          Email
          <Input className="mt-1" name="email" type="email" autoComplete="email" required />
        </label>
        <label className="block text-sm font-medium">
          Password
          <Input className="mt-1" name="password" type="password" autoComplete="current-password" minLength={8} required />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Log in"}
        </Button>
        <p className="text-sm">
          <Link href="/forgot-password" className="font-semibold text-[rgb(var(--wtws-blue))]">
            Forgot password?
          </Link>
        </p>
      </form>

      <p className="mt-6 text-sm">
        New here?{" "}
        <Link href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="font-semibold text-[rgb(var(--wtws-blue))]">
          Sign up free
        </Link>
      </p>
    </div>
  );
}
