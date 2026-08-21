"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/client";

export function ConfirmCheckout() {
  const router = useRouter();
  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) return;
    apiClient(`/payments/confirm?session_id=${sessionId}`)
      .catch(() => undefined)
      .finally(() => {
        window.history.replaceState({}, "", window.location.pathname);
        router.refresh();
      });
  }, [router]);
  return null;
}
