"use client";

import Link from "next/link";

interface PageHeaderProps {
  badge?: string;
  badgeColor?: "blue" | "emerald" | "orange" | "slate";
  title: string;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
}

const badgeColors = {
  blue: "bg-blue-100 text-blue-700",
  emerald: "bg-emerald-100 text-emerald-700",
  orange: "bg-orange-100 text-orange-700",
  slate: "bg-slate-100 text-slate-700",
};

export function PageHeader({ badge, badgeColor = "blue", title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 flex-1">
        {badge && (
          <span className={`inline-block rounded-lg px-2.5 py-0.5 text-[11px] font-semibold sm:px-3 sm:py-1 sm:text-xs ${badgeColors[badgeColor]}`}>
            {badge}
          </span>
        )}
        <h1 className={`${badge ? "mt-2 sm:mt-3" : ""} text-2xl font-bold text-slate-900 sm:text-3xl`}>{title}</h1>
        {subtitle && <div className="mt-1.5 text-sm text-slate-600 sm:mt-2 sm:text-base">{subtitle}</div>}
      </div>
      {children && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide sm:flex-wrap sm:gap-4 sm:overflow-visible sm:pb-0">
          {children}
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  badge?: string;
  badgeColor?: "emerald" | "blue" | "orange" | "slate";
  href?: string;
  buttonText?: string;
  gradient?: boolean;
}

const statBadgeColors = {
  emerald: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-700",
  orange: "bg-orange-100 text-orange-700",
  slate: "bg-slate-100 text-slate-700",
};

export function StatCard({ icon, label, sublabel, badge, badgeColor = "emerald", href, buttonText, gradient }: StatCardProps) {
  return (
    <div className={`shrink-0 rounded-xl border border-slate-200 p-3 text-center min-w-[140px] sm:min-w-[160px] sm:rounded-2xl sm:p-4 ${gradient ? "bg-gradient-to-br from-emerald-50 to-teal-50" : "bg-white"}`}>
      <div className={`mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-full sm:mb-2 sm:h-10 sm:w-10 ${gradient ? "bg-emerald-100" : "bg-slate-100"}`}>
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-900 sm:text-base">{label}</p>
      {sublabel && <p className="text-[11px] text-slate-500 sm:text-xs">{sublabel}</p>}
      {badge && (
        <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase sm:mt-2 sm:text-[10px] ${statBadgeColors[badgeColor]}`}>
          {badge}
        </span>
      )}
      {href && buttonText && (
        <Link
          href={href}
          className={`mt-2 block rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:mt-3 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm ${
            gradient
              ? "bg-emerald-500 text-white hover:bg-emerald-600"
              : "border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {buttonText}
        </Link>
      )}
    </div>
  );
}

interface CompletedBadgesProps {
  items: string[];
}

export function CompletedBadges({ items }: CompletedBadgesProps) {
  if (items.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:mt-4 sm:gap-2">
      <span className="text-xs text-slate-500 sm:text-sm">COMPLETED:</span>
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 sm:gap-1 sm:px-3 sm:py-1 sm:text-sm"
        >
          <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {item}
        </span>
      ))}
    </div>
  );
}
