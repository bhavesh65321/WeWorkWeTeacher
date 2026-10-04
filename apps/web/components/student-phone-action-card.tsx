"use client";

import Link from "next/link";
import type { Me } from "@/lib/api";

export function StudentPhoneActionCard({ user }: { user: Me }) {
  if (user.phone) return null;

  return (
    <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900">Add your phone number</h3>
          <p className="mt-1 text-sm text-amber-700">
            Tutors need your phone number to contact you after payment
          </p>
        </div>
        <Link
          href="/settings"
          className="whitespace-nowrap rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
        >
          Add phone
        </Link>
      </div>
    </div>
  );
}
