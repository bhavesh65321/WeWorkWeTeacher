import { apiClient } from "@/lib/client";

export async function signOut() {
  await apiClient("/auth/logout", { method: "POST" }).catch(() => undefined);
  await fetch("/auth/session", { method: "DELETE" });
}
