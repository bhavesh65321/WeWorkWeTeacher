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
    <div className="relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 sm:rounded-2xl sm:p-5">
      {badge && (
        <span className="absolute right-3 top-3 rounded-md bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-blue-700 sm:right-4 sm:top-4 sm:px-2 sm:text-[10px]">
          {badge}
        </span>
      )}
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 sm:mb-3 sm:h-10 sm:w-10 sm:rounded-xl">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{title}</h3>
      <p className="mt-0.5 flex-1 text-xs text-slate-500 sm:mt-1 sm:text-sm">{description}</p>
      <Link
        href={href}
        className={`mt-3 block rounded-lg px-3 py-2 text-center text-xs font-semibold transition sm:mt-4 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm ${buttonVariants[buttonVariant]}`}
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
    <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:gap-4 sm:rounded-2xl sm:p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 sm:h-12 sm:w-12 sm:rounded-xl">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{title}</h3>
          {badge && (
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:px-2 sm:text-xs ${infoBadgeColors[badgeColor]}`}>
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{description}</p>
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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">{title}</h2>
          {badge && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-3 sm:py-1 sm:text-xs ${sectionBadgeColors[badgeColor]}`}>
              {badge}
            </span>
          )}
        </div>
        {rightText && <span className="text-xs text-slate-500 sm:text-sm">{rightText}</span>}
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
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {filters.map((filter) => (
        <Link
          key={filter.href}
          href={filter.href}
          className={`rounded-full px-3 py-1 text-xs font-medium transition sm:px-4 sm:py-1.5 sm:text-sm ${
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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center sm:rounded-2xl sm:px-6 sm:py-12">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 sm:mb-4 sm:h-14 sm:w-14">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-slate-500 sm:text-sm">{description}</p>
      {href && buttonText && (
        <Link
          href={href}
          className="mt-3 rounded-lg bg-[rgb(var(--wtws-blue))] px-4 py-2 text-xs font-semibold text-white hover:bg-[rgb(var(--wtws-blue-dark))] sm:mt-4 sm:rounded-xl sm:px-6 sm:py-2.5 sm:text-sm"
        >
          {buttonText}
        </Link>
      )}
    </div>
  );
}
