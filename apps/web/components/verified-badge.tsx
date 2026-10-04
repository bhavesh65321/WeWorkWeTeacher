"use client";

export function VerifiedBadge({ type }: { type: "email" | "phone" }) {
  const label = type === "email" ? "Email verified" : "Phone verified";

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
      <span>✓</span>
      <span>{label}</span>
    </span>
  );
}
