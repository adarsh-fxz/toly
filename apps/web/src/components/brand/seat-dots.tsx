import { cn } from "@/lib/utils";

// Filled dots are friends who joined; outlined dots are open seats.
export function SeatDots({
  filled,
  total,
  size = "md",
  className,
}: {
  filled: number;
  total: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dot = { sm: "size-2.5", md: "size-4", lg: "size-9" }[size];
  return (
    <span
      role="img"
      aria-label={`${filled} of ${total} seats filled`}
      className={cn(
        "inline-flex flex-wrap gap-1.5",
        size === "lg" && "gap-3",
        className,
      )}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: dots are positional
          key={i}
          className={cn(
            dot,
            "rounded-full border-2 border-primary",
            i < filled ? "bg-primary" : "bg-transparent",
          )}
        />
      ))}
    </span>
  );
}
