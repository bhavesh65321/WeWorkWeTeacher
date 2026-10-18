"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Me } from "@/lib/api";
import { RoleSwitch } from "./role-switch";
import { AccountMenu } from "./account-menu";
import { BrandMark } from "./brand-mark";

function isAppPath(path: string) {
  if (
    path.startsWith("/dashboard") ||
    path.startsWith("/wallet") ||
    path.startsWith("/inbox") ||
    path.startsWith("/settings") ||
    path.startsWith("/notifications") ||
    path.startsWith("/reviews") ||
    path.startsWith("/admin") ||
    path.startsWith("/onboarding")
  ) {
    return true;
  }
  if (path === "/tutors/edit" || path.startsWith("/tutors/edit/")) return true;
  if (path === "/jobs/new" || path.startsWith("/jobs/new")) return true;
  if (path === "/jobs/mine" || path.startsWith("/jobs/mine")) return true;
  if (/^\/jobs\/[^/]+\/edit/.test(path)) return true;
  return false;
}

export function Header({ me }: { me: Me | null }) {
  const path = usePathname() || "/";
  const app = Boolean(me) && isAppPath(path);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-4 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 sm:gap-8">
          <BrandMark />
          <nav className="hidden items-center gap-1 lg:flex">
            {app && me ? <AppNav me={me} /> : <PublicNav />}
          </nav>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {me ? <LoggedInTools me={me} app={app} /> : <GuestTools />}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children, badge }: { href: string; children: React.ReactNode; badge?: string }) {
  const path = usePathname() || "/";
  const isActive = path === href || (href !== "/" && path.startsWith(href));
  
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
        isActive 
          ? "bg-blue-50 text-[rgb(var(--wtws-blue))]" 
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {children}
      {badge && (
        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
          {badge}
        </span>
      )}
    </Link>
  );
}

function PublicNav() {
  return (
    <>
      <NavLink href="/tutors">Find tutors</NavLink>
      <NavLink href="/jobs/new">Post a job</NavLink>
      <NavLink href="/how-it-works">How it works</NavLink>
    </>
  );
}

function AppNav({ me }: { me: Me }) {
  const isTutor = me.activeRole === "TUTOR";
  return (
    <>
      <NavLink href="/dashboard">Dashboard</NavLink>
      {isTutor ? (
        <>
          <NavLink href="/jobs?matched=1">Jobs</NavLink>
          <NavLink href="/inbox">Inbox</NavLink>
          <NavLink href="/wallet">Wallet</NavLink>
          <NavLink href="/tutors/edit">Profile</NavLink>
        </>
      ) : (
        <>
          <NavLink href="/jobs/mine">My posts</NavLink>
          <NavLink href="/tutors">Find tutors</NavLink>
          <NavLink href="/inbox">Inbox</NavLink>
          <NavLink href="/wallet">Wallet</NavLink>
        </>
      )}
    </>
  );
}

function GuestTools() {
  return (
    <>
      <Link 
        href="/login" 
        className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 sm:px-4"
      >
        Log in
      </Link>
      <Link
        href="/register"
        className="rounded-lg bg-[rgb(var(--wtws-blue))] px-3 py-2 text-sm font-semibold text-white hover:bg-[rgb(var(--wtws-blue-dark))] sm:px-4"
      >
        Sign up
      </Link>
    </>
  );
}

function LoggedInTools({ me, app }: { me: Me; app: boolean }) {
  return (
    <>
      {/* Coins badge - compact on mobile */}
      <Link
        href="/wallet"
        className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-2 py-1 text-xs font-semibold text-amber-700 hover:from-amber-100 hover:to-orange-100 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm"
      >
        <span className="text-sm sm:text-base">🪙</span>
        <span>{me.coinBalance ?? 0}</span>
      </Link>

      {/* Role switch - hidden on mobile */}
      {app && <div className="hidden sm:block"><RoleSwitch me={me} /></div>}

      {/* Notifications - always visible */}
      <Link 
        href="/notifications" 
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 sm:h-10 sm:w-10"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {(me.unreadCount ?? 0) > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {(me.unreadCount ?? 0) > 99 ? "99+" : me.unreadCount}
          </span>
        )}
      </Link>

      {/* Admin link - hidden on mobile */}
      {me.isAdmin && (
        <Link 
          href="/admin" 
          className="hidden h-9 items-center rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:flex"
        >
          Admin
        </Link>
      )}

      {/* Account menu */}
      <AccountMenu me={me} />
    </>
  );
}
