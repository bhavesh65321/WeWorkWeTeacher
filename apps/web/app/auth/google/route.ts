import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const next = params.get("next");
  const redirectUri = `${SITE.replace(/\/$/, "")}/auth/google/callback`;
  const res = await fetch(`${API}/api/auth/google/url?redirectUri=${encodeURIComponent(redirectUri)}`);
  const body = (await res.json().catch(() => ({}))) as { url?: string; message?: string };
  if (!res.ok || !body.url) {
    return NextResponse.redirect(new URL(`/login?google=off`, SITE));
  }
  const out = NextResponse.redirect(body.url);
  if (next?.startsWith("/") && !next.startsWith("//")) {
    out.cookies.set("wtws_next", next, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 });
  }
  if (params.get("as") === "tutor") {
    out.cookies.set("wtws_as", "tutor", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 });
  }
  return out;
}
