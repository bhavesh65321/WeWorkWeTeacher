import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const err = url.searchParams.get("error");
  if (err || !code) {
    return NextResponse.redirect(new URL("/login?google=denied", SITE));
  }
  const redirectUri = `${SITE.replace(/\/$/, "")}/auth/google/callback`;
  const exchange = await fetch(`${API}/api/auth/google/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, redirectUri }),
  });
  const body = (await exchange.json().catch(() => ({}))) as {
    token?: string;
    needsVerify?: boolean;
    message?: string;
  };
  if (!exchange.ok || !body.token) {
    return NextResponse.redirect(new URL("/login?google=failed", SITE));
  }
  const nextCookie = request.headers.get("cookie")?.match(/(?:^|; )wtws_next=([^;]+)/)?.[1];
  const next = nextCookie ? decodeURIComponent(nextCookie) : "/dashboard";
  const dest = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  const res = NextResponse.redirect(new URL(dest, SITE));
  res.cookies.set("wtws_token", body.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  res.cookies.delete("wtws_next");
  return res;
}
