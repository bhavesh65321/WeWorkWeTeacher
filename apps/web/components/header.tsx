"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Me } from "@/lib/api";
import { RoleSwitch } from "./role-switch";
import { NavDropdown } from "./nav-dropdown";
import { BrandMark } from "./brand-mark";
import { AccountMenu } from "./account-menu";

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

const publicLink = "rounded-lg px-3.5 py-2 hover:bg-blue-50/60 hover:text-[rgb(var(--wtws-blue))]";

export function Header({ me }: { me: Me | null }) {
  const path = usePathname() || "/";
  const app = Boolean(me) && isAppPath(path);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:h-20 sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 lg:gap-8">
          <BrandMark />
          <nav className="hidden items-center gap-1 text-sm font-semibold text-slate-700 lg:flex">
            {app && me ? <AppNav me={me} /> : <PublicNav />}
          </nav>
        </div>
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          {me ? <LoggedInTools me={me} app={app} /> : <GuestTools />}
        </div>
      </div>
      <nav className="mx-auto flex max-w-7xl gap-4 overflow-x-auto px-4 pb-2 text-sm font-medium text-[rgb(var(--muted-foreground))] lg:hidden sm:px-6">
        {app && me ? <AppMobileNav me={me} /> : <PublicMobileNav me={me} />}
      </nav>
    </header>
  );
}

function PublicNav() {
  return (
    <>
      <Link href="/tutors" className={publicLink}>
        Find tutors
      </Link>
      <Link href="/jobs" className={publicLink}>
        Jobs
      </Link>
      <Link href="/jobs/new" className={publicLink}>
        Post a job
      </Link>
      <Link href="/how-it-works" className={publicLink}>
        How it works
      </Link>
    </>
  );
}

function AppNav({ me }: { me: Me }) {
  return (
    <>
      <Link href="/dashboard" className="hover:text-[rgb(var(--foreground))]">
        Dashboard
      </Link>
      {me.activeRole === "STUDENT" ? (
        <>
          <Link href="/jobs/mine" className="hover:text-[rgb(var(--foreground))]">
            My posts
          </Link>
          <Link href="/tutors" className="hover:text-[rgb(var(--foreground))]">
            Find tutors
          </Link>
        </>
      ) : (
        <NavDropdown
          label="Jobs"
          items={[
            { href: "/jobs", label: "All jobs" },
            { href: "/jobs?matched=1", label: "Matching my skills" },
            { href: "/jobs/mine", label: "My posts" },
          ]}
        />
      )}
      <Link href="/wallet" className="hover:text-[rgb(var(--foreground))]">
        Wallet
      </Link>
      {me.roles.includes("TUTOR") && me.activeRole === "TUTOR" ? (
        <Link href="/tutors/edit" className="hover:text-[rgb(var(--foreground))]">
          Edit profile
        </Link>
      ) : null}
      <Link href="/inbox" className="hover:text-[rgb(var(--foreground))]">
        Messages
      </Link>
    </>
  );
}

function GuestTools() {
  return (
    <>
      <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
        Log in
      </Link>
      <Link
        href="/register"
        className="rounded-xl bg-[rgb(var(--wtws-blue))] px-5 py-2.5 text-sm font-bold text-white hover:bg-[rgb(var(--wtws-blue-dark))]"
      >
        Sign up
      </Link>
    </>
  );
}

function LoggedInTools({ me, app }: { me: Me; app: boolean }) {
  return (
    <>
      {app ? (
        <>
          <Link
            href="/wallet"
            className="rounded-full bg-[rgb(var(--muted))] px-2.5 py-1.5 text-xs font-semibold sm:px-3 sm:text-sm"
          >
            {me.coinBalance ?? 0} coins
          </Link>
          <RoleSwitch me={me} />
        </>
      ) : (
        <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-[rgb(var(--muted))]">
          Dashboard
        </Link>
      )}
      <Link href="/notifications" className="relative rounded-lg px-2 py-2 text-sm font-semibold hover:bg-[rgb(var(--muted))]">
        Alerts
        {(me.unreadCount ?? 0) > 0 ? (
          <span className="absolute right-0 top-0 rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
            {(me.unreadCount ?? 0) > 99 ? "99+" : me.unreadCount}
          </span>
        ) : null}
      </Link>
      {me.isAdmin ? (
        <Link href="/admin" className="hidden text-sm font-semibold text-[rgb(var(--wtws-blue))] sm:inline">
          Admin
        </Link>
      ) : null}
      {app && me.activeRole === "STUDENT" ? (
        <Link
          href="/jobs/new"
          className="hidden rounded-lg bg-[rgb(var(--wtws-teal))] px-3 py-2 text-sm font-semibold text-white hover:opacity-90 lg:inline"
        >
          Post requirement
        </Link>
      ) : null}
      <AccountMenu me={me} />
    </>
  );
}

function PublicMobileNav({ me }: { me: Me | null }) {
  return (
    <>
      <Link href="/tutors" className="shrink-0 hover:text-[rgb(var(--foreground))]">
        Find tutors
      </Link>
      <Link href="/jobs" className="shrink-0 hover:text-[rgb(var(--foreground))]">
        Jobs
      </Link>
      <Link href="/jobs/new" className="shrink-0 hover:text-[rgb(var(--foreground))]">
        Post
      </Link>
      {me ? (
        <>
          <Link href="/dashboard" className="shrink-0 hover:text-[rgb(var(--foreground))]">
            Dashboard
          </Link>
          <Link href="/settings" className="shrink-0 hover:text-[rgb(var(--foreground))]">
            Settings
          </Link>
        </>
      ) : (
        <>
          <Link href="/login" className="shrink-0 hover:text-[rgb(var(--foreground))]">
            Log in
          </Link>
          <Link href="/register" className="shrink-0 font-semibold text-[rgb(var(--wtws-blue))]">
            Sign up
          </Link>
        </>
      )}
    </>
  );
}

function AppMobileNav({ me }: { me: Me }) {
  return (
    <>
      <Link href="/dashboard" className="shrink-0 hover:text-[rgb(var(--foreground))]">
        Dashboard
      </Link>
      <Link href="/" className="shrink-0 hover:text-[rgb(var(--foreground))]">
        Home
      </Link>
      <Link href="/jobs" className="shrink-0 hover:text-[rgb(var(--foreground))]">
        Jobs
      </Link>
      <Link href="/tutors" className="shrink-0 hover:text-[rgb(var(--foreground))]">
        Teachers
      </Link>
      <Link href="/inbox" className="shrink-0 hover:text-[rgb(var(--foreground))]">
        Messages
      </Link>
      <Link href="/wallet" className="shrink-0 hover:text-[rgb(var(--foreground))]">
        Wallet
      </Link>
      <Link href="/settings" className="shrink-0 hover:text-[rgb(var(--foreground))]">
        Settings
      </Link>
    </>
  );
}
