import Image from "next/image";
import Link from "next/link";

export function BrandMark({ size = "default" }: { size?: "default" | "sm" | "lg" }) {
  const heights = { sm: 28, default: 36, lg: 48 } as const;
  const height = heights[size];
  const width = Math.round(height * (600 / 258));

  return (
    <Link href="/" className="inline-flex shrink-0 items-center" aria-label="gurumates home">
      <Image
        src="/brand/logo.png"
        alt="gurumates"
        width={width}
        height={height}
        className="h-8 w-auto sm:h-9"
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
      width={40}
      height={40}
      className={className ?? "h-9 w-9"}
    />
  );
}
