import { formatRs } from "@toly/shared/money";
import { Lightbulb } from "lucide-react";
import Link from "next/link";
import type { VenueInsights } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DailyBars } from "./daily-bars";

const RANGES = [7, 30, 90] as const;

const hourLabel = (h: number) => {
  const end = (h + 1) % 24;
  const fmt = (n: number) =>
    `${n % 12 === 0 ? 12 : n % 12}${n < 12 ? "am" : "pm"}`;
  return `${fmt(h)} to ${fmt(end)}`;
};

// Views were only counted from launch, so a ratio over 100% means "not enough data", not a real rate.
const rate = (part: number, whole: number) =>
  whole > 0 && part <= whole ? `${Math.round((part / whole) * 100)}%` : "–";

export function Insights({
  data,
  merchantId,
}: {
  data: VenueInsights;
  merchantId: string;
}) {
  const { funnel } = data;
  const tiles = [
    {
      label: "Deal views",
      value: funnel.views,
      note: "Visitors who opened a deal",
    },
    {
      label: "Tolys started",
      value: funnel.started,
      note: `${rate(funnel.started, funnel.views)} of views`,
    },
    {
      label: "Unlocked",
      value: funnel.unlocked,
      note: `${rate(funnel.unlocked, funnel.started)} filled in time`,
    },
    {
      label: "Came in and redeemed",
      value: funnel.redeemed,
      note: "Group and spin vouchers",
    },
  ];

  return (
    <section aria-labelledby="insights" className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="insights"
          className="font-sans text-xl font-semibold [font-variation-settings:normal]"
        >
          How Toly is doing for you
        </h2>
        <nav
          aria-label="Time range"
          className="flex rounded-full border bg-card p-1"
        >
          {RANGES.map((days) => (
            <Link
              key={days}
              href={`/merchant/${merchantId}?days=${days}`}
              scroll={false}
              aria-current={data.days === days ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground",
                data.days === days && "bg-ink text-ink-foreground",
              )}
            >
              {days} days
            </Link>
          ))}
        </nav>
      </div>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="space-y-1 bg-card p-4">
            <dt className="text-sm text-muted-foreground">{t.label}</dt>
            <dd className="font-display text-4xl font-extrabold tabular font-condensed">
              {t.value}
            </dd>
            <dd className="text-xs text-muted-foreground">{t.note}</dd>
          </div>
        ))}
      </dl>

      {data.suggestions.length > 0 ? (
        <ul className="space-y-2">
          {data.suggestions.map((s) => (
            <li
              key={s.dealId}
              className="flex gap-3 rounded-xl bg-secondary p-4 text-sm"
            >
              <Lightbulb className="mt-0.5 size-4 shrink-0" aria-hidden />
              {s.message}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <DailyBars days={data.daily} />
        <dl className="space-y-4">
          <div>
            <dt className="text-sm text-muted-foreground">
              Bills recorded at redemption
            </dt>
            <dd className="text-2xl font-bold tabular">
              {formatRs(data.bills.totalPaisa)}
            </dd>
            <dd className="text-xs text-muted-foreground">
              From {data.bills.count}{" "}
              {data.bills.count === 1 ? "bill" : "bills"} your staff entered.
              Reported by you, not verified by Toly.
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Spins sold</dt>
            <dd className="text-2xl font-bold tabular">{data.spins.paid}</dd>
            <dd className="text-xs text-muted-foreground">
              {data.spins.redeemed} prize vouchers redeemed
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">
              Busiest redemption hours
            </dt>
            <dd className="font-medium">
              {data.busiestHours.length
                ? data.busiestHours.map((h) => hourLabel(h.hour)).join(", ")
                : "Not enough visits yet"}
            </dd>
          </div>
        </dl>
      </div>

      {data.deals.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-sm">
            <caption className="sr-only">Results by deal</caption>
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th scope="col" className="py-2 pr-4 font-medium">
                  Deal
                </th>
                {["Views", "Started", "Unlocked", "Redeemed"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="py-2 pl-4 text-right font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.deals.map((d) => (
                <tr key={d.id} className="border-b last:border-b-0">
                  <th scope="row" className="py-3 pr-4 text-left font-medium">
                    {d.title}
                    {d.status !== "live" ? (
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        ({d.status})
                      </span>
                    ) : null}
                  </th>
                  {[d.views, d.started, d.unlocked, d.redeemed].map((n, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: fixed column order
                    <td key={i} className="py-3 pl-4 text-right tabular">
                      {n}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
