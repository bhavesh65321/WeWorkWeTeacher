"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Me } from "@/lib/api";
import { apiClient } from "@/lib/client";

export function RoleSwitch({ me }: { me: Me }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isTutor = me.roles.includes("TUTOR");

  async function toTutor() {
    try {
      setLoading(true);
      if (!isTutor) await apiClient("/auth/enable-tutor", { method: "POST" });
      else await apiClient("/auth/role", { method: "POST", body: JSON.stringify({ role: "TUTOR" }) });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Role switch error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function toStudent() {
    try {
      setLoading(true);
      await apiClient("/auth/role", { method: "POST", body: JSON.stringify({ role: "STUDENT" }) });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Role switch error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5">
      <button
        type="button"
        onClick={toStudent}
        disabled={loading}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
          me.activeRole === "STUDENT" 
            ? "bg-white text-slate-900 shadow-sm" 
            : "text-slate-500 hover:text-slate-700"
        } ${loading ? "opacity-50" : ""}`}
      >
        Student
      </button>
      <button
        type="button"
        onClick={toTutor}
        disabled={loading}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
          me.activeRole === "TUTOR" 
            ? "bg-white text-slate-900 shadow-sm" 
            : "text-slate-500 hover:text-slate-700"
        } ${loading ? "opacity-50" : ""}`}
      >
        Tutor
      </button>
    </div>
  );
}
