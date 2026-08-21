import type { ReactNode } from "react";

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-[rgb(var(--muted))] px-2.5 py-0.5 text-xs font-medium text-[rgb(var(--muted-foreground))] ${className}`}
    >
      {children}
    </span>
  );
}
