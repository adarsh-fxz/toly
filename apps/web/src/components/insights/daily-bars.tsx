"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Day = { day: string; count: number };

const label = (iso: string) =>
  new Intl.DateTimeFormat("en-NP", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
  }).format(new Date(`${iso}T00:00:00Z`));

/** Single-series bar chart: redemptions per day for the last two weeks, with a per-bar tooltip. */
export function DailyBars({ days }: { days: Day[] }) {
  const [asTable, setAsTable] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((sum, d) => sum + d.count, 0);
  const shown = active === null ? null : days[active];

  return (
    <figure className="min-w-0 space-y-4 rounded-xl bg-card p-6 shadow-1">
      <figcaption className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">Redemptions, last 14 days</span>
        <span
          className="text-sm text-muted-foreground tabular"
          aria-live="polite"
        >
          {shown ? `${label(shown.day)}: ${shown.count}` : `${total} total`}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAsTable((v) => !v)}
          aria-pressed={asTable}
        >
          {asTable ? "Show as chart" : "Show as table"}
        </Button>
      </figcaption>
      {asTable ? (
        <table className="w-full text-sm tabular-nums">
          <caption className="sr-only">Redemptions per day</caption>
          <thead>
            <tr className="border-b text-left text-ink-2">
              <th scope="col" className="py-2 font-semibold">
                Day
              </th>
              <th scope="col" className="py-2 text-right font-semibold">
                Redeemed
              </th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.day} className="border-b last:border-0">
                <th scope="row" className="py-2 text-left font-normal">
                  {label(d.day)}
                </th>
                <td className="py-2 text-right">{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <>
          <div className="relative h-36 border-b border-border">
            {[0, 25, 50, 75].map((top) => (
              <div
                key={top}
                aria-hidden
                className="absolute inset-x-0 border-t border-dashed border-border"
                style={{ top: `${top}%` }}
              />
            ))}
            <ol className="absolute inset-0 flex items-end gap-0.5">
              {days.map((d, i) => (
                <li
                  key={d.day}
                  className="relative flex h-full min-w-0 flex-1 items-end"
                >
                  <button
                    type="button"
                    aria-label={`${label(d.day)}: ${d.count} redeemed`}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    className="group flex h-full w-full items-end focus-visible:outline-none"
                  >
                    {active === i ? (
                      <span
                        className="pointer-events-none absolute -top-3 z-10 -translate-y-full whitespace-nowrap rounded-[14px] bg-foreground px-3 py-2 text-xs text-background shadow-2"
                        style={{
                          left: i < days.length / 2 ? 0 : undefined,
                          right: i >= days.length / 2 ? 0 : undefined,
                        }}
                        aria-hidden
                      >
                        {label(d.day)} · {d.count} redeemed
                      </span>
                    ) : null}
                    <span
                      className="block w-full rounded-t-[4px] bg-chart-1 transition-[height,opacity] duration-600 motion-reduce:transition-none group-hover:opacity-80 group-focus-visible:ring-3 group-focus-visible:ring-ring/50"
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
        </>
      )}
    </figure>
  );
}
