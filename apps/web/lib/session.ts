export async function persistSession(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("wtws_token", token);
  }
}

export function afterAuthPath(opts: { needsVerify?: boolean; next?: string | null }) {
  if (opts.needsVerify) return "/verify";
  if (opts.next?.startsWith("/") && !opts.next.startsWith("//")) return opts.next;
  return "/dashboard";
}
