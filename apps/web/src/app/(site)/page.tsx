import { MERCHANT_CATEGORIES } from "@toly/shared/merchant";
import { formatRs } from "@toly/shared/money";
import { Dices } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { SeatDots } from "@/components/brand/seat-dots";
import { DealListSkeleton } from "@/components/deal/deal-list-skeleton";
import { DealRow } from "@/components/deal/deal-row";
import { publicApi } from "@/lib/api-server";
import { cn } from "@/lib/utils";

const steps = [
  { filled: 1, text: "Pick a deal and start a toly. You get a link to share." },
  {
    filled: 3,
    text: "Friends join from the link. Every seat is a verified number.",
  },
  {
    filled: 4,
    text: "Seats full, deal unlocked. Show the code at the counter and pay the venue.",
  },
];

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <section className="grid gap-10 py-12 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-end md:py-20">
        <h1 className="text-6xl font-extrabold font-condensed md:text-8xl">
          Round up your toly. Unlock the table.
        </h1>
        <ol className="space-y-5">
          {steps.map((step, i) => (
            <li
              key={step.text}
              className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4"
            >
              <SeatDots
                filled={step.filled}
                total={4}
                size="sm"
                className="mt-2"
              />
              <p>
                <span className="sr-only">Step {i + 1}: </span>
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="deals-heading" className="space-y-4">
        <h2 id="deals-heading" className="text-3xl font-extrabold">
          Deals near you
        </h2>
        <Suspense fallback={<DealListSkeleton />}>
          <Deals searchParams={searchParams} />
        </Suspense>
      </section>

      <Suspense fallback={null}>
        <SpinVenues />
      </Suspense>
    </>
  );
}

async function Deals({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const { category: raw } = await searchParams;
  const category =
    typeof raw === "string" && raw in MERCHANT_CATEGORIES ? raw : undefined;
  const deals = await publicApi.api.v1.deals
    .$get({ query: { category } })
    .then((r) => (r.ok ? r.json() : []));

  return (
    <>
      <nav
        aria-label="Filter by category"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0"
      >
        <CategoryChip href="/" active={!category} label="Everything" />
        {Object.entries(MERCHANT_CATEGORIES)
          .filter(([key]) => key !== "other")
          .map(([key, label]) => (
            <CategoryChip
              key={key}
              href={`/?category=${key}`}
              active={category === key}
              label={label}
            />
          ))}
      </nav>
      {deals.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-6 py-14 text-center">
          <p className="font-semibold">No deals here yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {category
              ? "Try another category."
              : "New venues are joining every week. Check back soon."}
          </p>
        </div>
      ) : (
        <ul className="grid divide-y md:grid-cols-2 md:gap-x-8 md:divide-y-0">
          {deals.map((deal) => (
            <li key={deal.id} className="md:border-b">
              <DealRow deal={deal} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

async function SpinVenues() {
  const wheels = await publicApi.api.v1.wheels
    .$get()
    .then((r) => (r.ok ? r.json() : []));
  if (wheels.length === 0) return null;
  return (
    <section aria-labelledby="spin-heading" className="mt-16 space-y-4">
      <h2 id="spin-heading" className="text-3xl font-extrabold">
        Spin for a discount
      </h2>
      <p className="max-w-prose text-muted-foreground">
        Going solo? Spin a venue's wheel. Every spin wins a voucher, and the
        odds are shown before you pay.
      </p>
      <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        {wheels.map((w) => (
          <li key={w.slug} className="shrink-0">
            <Link
              href={`/spin/${w.slug}`}
              className="flex w-64 items-center gap-3 rounded-2xl bg-prize p-4 text-prize-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Dices className="size-7 shrink-0" aria-hidden />
              <span className="min-w-0">
                <span className="block truncate font-semibold">{w.name}</span>
                <span className="block text-sm">
                  {w.area}, {formatRs(w.pricePaisa)} a spin
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CategoryChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-10 shrink-0 items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        active
          ? "border-ink bg-ink text-ink-foreground"
          : "bg-card hover:border-foreground/30",
      )}
    >
      {label}
    </Link>
  );
}
