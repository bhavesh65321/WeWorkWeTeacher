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
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div>
        {badge && (
          <span className={`inline-block rounded-lg px-3 py-1 text-xs font-semibold ${badgeColors[badgeColor]}`}>
            {badge}
          </span>
        )}
        <h1 className={`${badge ? "mt-3" : ""} text-3xl font-bold text-slate-900`}>{title}</h1>
        {subtitle && <div className="mt-2 text-slate-600">{subtitle}</div>}
      </div>
      {children && <div className="flex flex-wrap gap-4">{children}</div>}
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
    <div className={`rounded-2xl border border-slate-200 p-4 text-center min-w-[160px] ${gradient ? "bg-gradient-to-br from-emerald-50 to-teal-50" : "bg-white"}`}>
      <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full ${gradient ? "bg-emerald-100" : "bg-slate-100"}`}>
        {icon}
      </div>
      <p className="font-semibold text-slate-900">{label}</p>
      {sublabel && <p className="text-xs text-slate-500">{sublabel}</p>}
      {badge && (
        <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statBadgeColors[badgeColor]}`}>
          {badge}
        </span>
      )}
      {href && buttonText && (
        <Link
          href={href}
          className={`mt-3 block rounded-xl px-4 py-2 text-sm font-semibold transition ${
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
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-sm text-slate-500">COMPLETED:</span>
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700"
        >
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {item}
        </span>
      ))}
    </div>
  );
}
