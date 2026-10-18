"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Me } from "@/lib/api";

const studentNavItems = [
  { href: "/dashboard", label: "Home", icon: HomeIcon },
  { href: "/jobs/mine", label: "My Posts", icon: BriefcaseIcon },
  { href: "/tutors", label: "Tutors", icon: SearchIcon },
  { href: "/inbox", label: "Chat", icon: ChatIcon },
  { href: "/wallet", label: "Wallet", icon: WalletIcon },
];

const tutorNavItems = [
  { href: "/dashboard", label: "Home", icon: HomeIcon },
  { href: "/jobs?matched=1", label: "Jobs", icon: BriefcaseIcon },
  { href: "/inbox", label: "Chat", icon: ChatIcon },
  { href: "/wallet", label: "Wallet", icon: WalletIcon },
  { href: "/tutors/edit", label: "Profile", icon: UserIcon },
];

export function MobileBottomNav({ me }: { me: Me | null }) {
  const path = usePathname() || "/";
  
  if (!me) return null;

  const navItems = me.activeRole === "TUTOR" ? tutorNavItems : studentNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-lg lg:hidden safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.map((item) => {
          const basePath = item.href.split("?")[0];
          const isActive = path === basePath || (basePath !== "/" && path.startsWith(basePath));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item ${isActive ? "active" : ""}`}
            >
              <Icon active={isActive} />
              <span>{item.label}</span>
              {item.href === "/inbox" && (me.unreadCount ?? 0) > 0 && (
                <span className="absolute -top-1 right-1/4 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {(me.unreadCount ?? 0) > 9 ? "9+" : me.unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-6 w-6 ${active ? "text-[rgb(var(--wtws-blue))]" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function BriefcaseIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-6 w-6 ${active ? "text-[rgb(var(--wtws-blue))]" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function ChatIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-6 w-6 ${active ? "text-[rgb(var(--wtws-blue))]" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function WalletIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-6 w-6 ${active ? "text-[rgb(var(--wtws-blue))]" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function MenuIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-6 w-6 ${active ? "text-[rgb(var(--wtws-blue))]" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function SearchIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-6 w-6 ${active ? "text-[rgb(var(--wtws-blue))]" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-6 w-6 ${active ? "text-[rgb(var(--wtws-blue))]" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
