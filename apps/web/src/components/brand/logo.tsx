import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Wordmark: "toly" + three seat dots (two filled, one open = "one seat left").
 * Dots hop and the open one fills on hover when rendered inside a `.group` (LogoLink does this).
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-display text-[27px] font-bold leading-none tracking-[-0.035em] text-foreground",
        className,
      )}
    >
      toly
      <svg
        className="wm-dots ml-[0.09em] h-[0.28em] w-[1.05em] overflow-visible"
        viewBox="0 0 34 9"
        aria-hidden="true"
      >
        <circle cx="4.5" cy="4.5" r="3.6" />
        <circle cx="16.5" cy="4.5" r="3.6" />
        <circle className="open" cx="28.5" cy="4.5" r="2.9" />
      </svg>
    </span>
  );
}

export function LogoLink({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="Toly home"
      className="group inline-flex min-h-11 items-center rounded-md"
    >
      <Wordmark className={className} />
    </Link>
  );
}

/**
 * Compact mark for app icons, link previews and the wheel hub:
 * three seats in a triangle, one open. `tile` draws the ink rounded square behind it.
 */
export function LogoMark({
  size = 32,
  tile = true,
  className,
}: {
  size?: number;
  tile?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={className}
    >
      {tile && <rect width="40" height="40" rx="11" fill="#17161C" />}
      <circle
        cx="20"
        cy={tile ? 13.5 : 11.5}
        r={tile ? 4.6 : 5.2}
        fill="#F2A23A"
      />
      <circle
        cx={tile ? 12.5 : 11.5}
        cy={tile ? 26.5 : 26}
        r={tile ? 4.6 : 5.2}
        fill="#F2A23A"
      />
      <circle
        cx={tile ? 27.5 : 28.5}
        cy={tile ? 26.5 : 26}
        r={tile ? 3.7 : 4.3}
        fill="none"
        stroke="#F2A23A"
        strokeWidth={tile ? 1.8 : 2}
      />
    </svg>
  );
}
