import Image from "next/image";
import Link from "next/link";

export function BrandMark({ size = "default" }: { size?: "default" | "sm" | "lg" }) {
  // trimmed logo.png is ~3.15:1 (277x88)
  const heights = { sm: 36, default: 44, lg: 56 } as const;
  const height = heights[size];
  const width = Math.round(height * (277 / 88));

  return (
    <Link href="/" className="inline-flex shrink-0 items-center" aria-label="gurumates home">
      <Image
        src="/brand/logo.png"
        alt="gurumates"
        width={width}
        height={height}
        className="h-10 w-auto sm:h-11"
        priority
      />
    </Link>
  );
}

export function BrandMarkIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/mark.png"
      alt="gurumates"
      width={48}
      height={48}
      className={className ?? "h-10 w-10"}
    />
  );
}
