import Link from "next/link";

export function BrandMark() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgb(var(--wtws-blue))] text-xl font-black text-white group-hover:bg-[rgb(var(--wtws-blue-dark))]">
        W
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-xl font-extrabold tracking-tight text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--wtws-blue))] sm:text-2xl">
          WTWS
        </span>
        <span className="-mt-0.5 hidden text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))] sm:inline">
          WeTeacherWeStudent
        </span>
      </span>
    </Link>
  );
}
