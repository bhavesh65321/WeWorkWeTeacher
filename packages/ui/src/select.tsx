import type { SelectHTMLAttributes } from "react";

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`min-h-11 w-full rounded-lg border border-[rgb(var(--border))] bg-white px-3 text-sm outline-none ring-[rgb(var(--wtws-blue))] focus:ring-2 ${className}`}
      {...props}
    />
  );
}
