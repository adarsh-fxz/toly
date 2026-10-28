import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Page width: 1160 px max, 40 px gutters (20 px on phones). Matches `.wrap` in the prototypes. */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1160px] px-10 max-sm:px-5",
        className,
      )}
      {...props}
    />
  );
}

/** Standard page body under the site header (L2 layout). */
export function Page({ className, ...props }: ComponentProps<"main">) {
  return (
    <main
      id="main"
      className={cn("pt-12 pb-6 max-sm:pt-7", className)}
      {...props}
    />
  );
}
