import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`min-h-11 w-full rounded-lg border border-[rgb(var(--border))] bg-white px-3 text-sm outline-none ring-[rgb(var(--wtws-blue))] placeholder:text-[rgb(var(--muted-foreground))] focus:ring-2 ${className}`}
      {...props}
    />
  );
}
