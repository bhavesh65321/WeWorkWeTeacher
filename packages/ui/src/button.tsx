import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";

const styles: Record<Variant, string> = {
  primary:
    "bg-[rgb(var(--wtws-blue))] text-white hover:bg-[rgb(var(--wtws-blue-dark))] shadow-sm",
  secondary: "bg-[rgb(var(--muted))] text-[rgb(var(--foreground))] hover:bg-[#e8ecf1]",
  ghost: "bg-transparent text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]",
  outline:
    "border border-[rgb(var(--border))] bg-white hover:bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
