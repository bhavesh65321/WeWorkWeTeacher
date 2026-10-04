import Link from "next/link";

export function BrandMark() {
  return (
    <Link href="/" className="group flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgb(var(--wtws-blue))] text-lg font-black text-white transition group-hover:bg-[rgb(var(--wtws-blue-dark))]">
        W
      </span>
      <div className="flex flex-col">
        <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-[rgb(var(--wtws-blue))]">
          WTWS
        </span>
        <span className="-mt-1 hidden text-[9px] font-medium uppercase tracking-wide text-slate-400 sm:block">
          WeTeacherWeStudent
        </span>
      </div>
    </Link>
  );
}
