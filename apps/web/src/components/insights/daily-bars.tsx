"use client";

import { useState } from "react";

type Day = { day: string; count: number };

const label = (iso: string) =>
  new Intl.DateTimeFormat("en-NP", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
  }).format(new Date(`${iso}T00:00:00Z`));

/** Single-series bar chart: redemptions per day for the last two weeks, with a per-bar tooltip. */
export function DailyBars({ days }: { days: Day[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((sum, d) => sum + d.count, 0);
  const shown = active === null ? null : days[active];

  return (
    <figure className="space-y-3">
      <figcaption className="flex items-baseline justify-between gap-4">
        <span className="font-semibold">Redemptions, last 14 days</span>
        <span
          className="text-sm text-muted-foreground tabular"
          aria-live="polite"
        >
          {shown ? `${label(shown.day)}: ${shown.count}` : `${total} total`}
        </span>
      </figcaption>
      <div className="relative h-36 border-b border-border">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 border-t border-dashed border-border"
        />
        <ol className="absolute inset-0 flex items-end gap-0.5">
          {days.map((d, i) => (
            <li key={d.day} className="flex h-full flex-1 items-end">
              <button
                type="button"
                aria-label={`${label(d.day)}: ${d.count} redeemed`}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="group flex h-full w-full items-end focus-visible:outline-none"
              >
                <span
                  className="block w-full rounded-t-[4px] bg-ink transition-opacity group-hover:opacity-80 group-focus-visible:ring-3 group-focus-visible:ring-ring/50"
                  style={{
                    height: d.count
                      ? `${Math.max(4, (d.count / max) * 100)}%`
                      : "2px",
                    opacity: d.count ? 1 : 0.25,
                  }}
                />
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{days[0] ? label(days[0].day) : null}</span>
        <span className="tabular">Peak {max}</span>
        <span>Today</span>
      </div>
    </figure>
  );
}
