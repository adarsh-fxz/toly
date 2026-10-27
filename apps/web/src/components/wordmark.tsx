import { cn } from "@/lib/utils";

// The three dots are the crew: the same seat dots used wherever a group appears.
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 font-display text-2xl font-extrabold leading-none tracking-tight font-condensed",
        className,
      )}
    >
      toly
      <span aria-hidden className="inline-flex gap-0.5">
        <span className="size-1.5 rounded-full bg-primary" />
        <span className="size-1.5 rounded-full bg-primary" />
        <span className="size-1.5 rounded-full border border-primary" />
      </span>
    </span>
  );
}
