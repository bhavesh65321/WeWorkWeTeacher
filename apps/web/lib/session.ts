export async function persistSession(token: string) {
  await fetch("/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
}

export function afterAuthPath(opts: { needsVerify?: boolean; next?: string | null }) {
  if (opts.needsVerify) return "/verify";
  if (opts.next?.startsWith("/") && !opts.next.startsWith("//")) return opts.next;
  return "/dashboard";
}
