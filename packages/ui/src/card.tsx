import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
