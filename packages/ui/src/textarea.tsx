import type { TextareaHTMLAttributes } from "react";

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-lg border border-[rgb(var(--border))] bg-white px-3 py-2 text-sm outline-none ring-[rgb(var(--wtws-blue))] placeholder:text-[rgb(var(--muted-foreground))] focus:ring-2 ${className}`}
      {...props}
    />
  );
}
