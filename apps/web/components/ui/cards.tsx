"use client";

import Link from "next/link";

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  buttonText: string;
  buttonVariant?: "default" | "premium" | "outline" | "success";
  badge?: string;
}

const buttonVariants = {
  default: "bg-[rgb(var(--wtws-blue))] text-white hover:bg-[rgb(var(--wtws-blue-dark))]",
  premium: "bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:from-amber-500 hover:to-orange-500",
  outline: "border border-slate-200 text-slate-700 hover:bg-slate-50",
  success: "bg-emerald-500 text-white hover:bg-emerald-600",
};

export function ActionCard({ icon, title, description, href, buttonText, buttonVariant = "default", badge }: ActionCardProps) {
  return (
    <div className="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
      {badge && (
        <span className="absolute right-4 top-4 rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
          {badge}
        </span>
      )}
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-slate-500">{description}</p>
      <Link
        href={href}
        className={`mt-4 block rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition ${buttonVariants[buttonVariant]}`}
      >
        {buttonText}
      </Link>
    </div>
  );
}

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: "emerald" | "blue" | "orange";
  children?: React.ReactNode;
}

const infoBadgeColors = {
  emerald: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-700",
  orange: "bg-orange-100 text-orange-700",
};

export function InfoCard({ icon, title, description, badge, badgeColor = "emerald", children }: InfoCardProps) {
  return (
    <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          {badge && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${infoBadgeColors[badgeColor]}`}>
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        {children}
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  badge?: string;
  badgeColor?: "blue" | "emerald" | "orange" | "slate";
  rightText?: string;
  children: React.ReactNode;
}

const sectionBadgeColors = {
  blue: "bg-blue-100 text-blue-700",
  emerald: "bg-emerald-100 text-emerald-700",
  orange: "bg-orange-100 text-orange-700",
  slate: "bg-slate-100 text-slate-600",
};

export function Section({ title, badge, badgeColor = "slate", rightText, children }: SectionProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {badge && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${sectionBadgeColors[badgeColor]}`}>
              {badge}
            </span>
          )}
        </div>
        {rightText && <span className="text-sm text-slate-500">{rightText}</span>}
      </div>
      {children}
    </section>
  );
}

interface FilterButtonsProps {
  filters: { label: string; href: string; active?: boolean }[];
}

export function FilterButtons({ filters }: FilterButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Link
          key={filter.href}
          href={filter.href}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            filter.active
              ? "border border-[rgb(var(--wtws-blue))] bg-blue-50 text-[rgb(var(--wtws-blue))]"
              : "border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {filter.label}
        </Link>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  buttonText?: string;
}

export function EmptyState({ icon, title, description, href, buttonText }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      {href && buttonText && (
        <Link
          href={href}
          className="mt-4 rounded-xl bg-[rgb(var(--wtws-blue))] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[rgb(var(--wtws-blue-dark))]"
        >
          {buttonText}
        </Link>
      )}
    </div>
  );
}
