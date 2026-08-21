import type { ReactNode } from "react";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="prose mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="mt-6 space-y-4 text-sm leading-6 text-[rgb(var(--foreground))]">{children}</div>
    </article>
  );
}
