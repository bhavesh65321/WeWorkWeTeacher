"use client";

import { useRouter } from "next/navigation";
import type { Me } from "@/lib/api";
import { apiClient } from "@/lib/client";

export function RoleSwitch({ me }: { me: Me }) {
  const router = useRouter();
  const isTutor = me.roles.includes("TUTOR");

  async function toTutor() {
    if (!isTutor) await apiClient("/auth/enable-tutor", { method: "POST" });
    else await apiClient("/auth/role", { method: "POST", body: JSON.stringify({ role: "TUTOR" }) });
    router.refresh();
  }

  async function toStudent() {
    await apiClient("/auth/role", { method: "POST", body: JSON.stringify({ role: "STUDENT" }) });
    router.refresh();
  }

  return (
    <div className="flex rounded-full bg-[rgb(var(--muted))] p-0.5 text-[11px] font-semibold sm:p-1 sm:text-xs">
      <button
        type="button"
        onClick={toStudent}
        className={`rounded-full px-2 py-1 sm:px-3 ${me.activeRole === "STUDENT" ? "bg-white shadow-sm" : "text-[rgb(var(--muted-foreground))]"}`}
      >
        Student
      </button>
      <button
        type="button"
        onClick={toTutor}
        className={`rounded-full px-2 py-1 sm:px-3 ${me.activeRole === "TUTOR" ? "bg-white shadow-sm" : "text-[rgb(var(--muted-foreground))]"}`}
      >
        Tutor
      </button>
    </div>
  );
}
