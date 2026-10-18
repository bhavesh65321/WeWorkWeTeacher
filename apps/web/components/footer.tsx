import Link from "next/link";
import { BrandMark } from "./brand-mark";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-10">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 border-b border-slate-100 pb-6 md:flex-row">
          <BrandMark />
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-600">
            <Link href="/how-it-works" className="hover:text-[rgb(var(--wtws-blue))]">
              How it works
            </Link>
            <Link href="/support" className="hover:text-[rgb(var(--wtws-blue))]">
              Support
            </Link>
            <Link href="/terms" className="hover:text-[rgb(var(--wtws-blue))]">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[rgb(var(--wtws-blue))]">
              Privacy
            </Link>
            <Link href="/refunds" className="hover:text-[rgb(var(--wtws-blue))]">
              Refunds
            </Link>
            <Link href="/jobs" className="hover:text-[rgb(var(--wtws-blue))]">
              Tutor jobs
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-slate-400 sm:flex-row">
          <p>© 2026 gurumates. Coins, Cards & UPI.</p>
          <p className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Open GA · classroom later
          </p>
        </div>
      </div>
    </footer>
  );
}
