"use client";

import { useInView, useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { groupNepali } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Counts up once (600 ms, ease-out) when scrolled into view; reduced motion shows the final value. */
function useCountUp(target: number, run: boolean) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (reduce) {
      setV(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 600);
      setV(Math.round(target * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, reduce]);
  return v;
}

/**
 * Dashboard stat tile: label, big number, one line of context, optional progress bar.
 * e.g. <StatTile label="Unlocked" value={152} note={<><b>71%</b> filled in time</>} progress={0.71} />
 */
export function StatTile({
  label,
  value,
  prefix,
  note,
  progress,
  className,
}: {
  label: string;
  value: number;
  prefix?: string;
  note?: ReactNode;
  progress?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const shown = useCountUp(value, inView);
  return (
    <div
      ref={ref}
      className={cn(
        "flex min-w-0 flex-col gap-1 rounded-3xl bg-card p-[22px] pb-5 shadow-1",
        className,
      )}
    >
      <span className="text-sm text-ink-2">{label}</span>
      <span
        className="font-display text-[38px] font-semibold leading-[1.1] tracking-[-0.035em] tabular-nums max-sm:text-[32px]"
        aria-hidden="true"
      >
        {prefix}
        {groupNepali(shown)}
      </span>
      <span className="sr-only">
        {prefix}
        {groupNepali(value)}
      </span>
      {note && (
        <span className="text-[13px] text-muted-foreground [&_b]:font-semibold [&_b]:text-ink-2">
          {note}
        </span>
      )}
      {progress != null && (
        <div
          className="mt-2.5 h-1 overflow-hidden rounded-full bg-secondary"
          aria-hidden="true"
        >
          <i
            className="block h-full rounded-full bg-primary"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
