import { MERCHANT_CATEGORIES } from "@toly/shared/merchant";
import { formatRs } from "@toly/shared/money";
import { Dices, Info } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { DealListSkeleton } from "@/components/deal/deal-list-skeleton";
import { DealRow } from "@/components/deal/deal-row";
import { HomeHero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Container } from "@/components/layout/container";
import { CurrentUserMenu } from "@/components/site-header";
import { segmentLabel, Wheel } from "@/components/spin/wheel";
import { publicApi } from "@/lib/api-server";
import { cn } from "@/lib/utils";

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <Suspense
        fallback={
          <HomeHero signedIn accountSlot={<span className="size-11" />} />
        }
      >
        <FeaturedHero />
      </Suspense>
      <Container>
        <HowItWorks />
        <section
          id="deals"
          aria-labelledby="deals-heading"
          className="space-y-7 scroll-mt-24"
        >
          <h2
            id="deals-heading"
            className="text-h2 font-semibold max-sm:text-[34px]"
          >
            Priced for the whole table.
          </h2>
          <Suspense fallback={<DealListSkeleton />}>
            <Deals searchParams={searchParams} />
          </Suspense>
        </section>

        <Suspense fallback={null}>
          <SpinVenues />
        </Suspense>
        <section className="night mt-28 rounded-2xl px-10 py-16 text-center max-sm:px-6 max-sm:py-12">
          <h2 className="relative text-h2 font-semibold max-sm:text-[34px]">
            Got a crew? Get the group price.
          </h2>
          <p className="relative mx-auto mt-5 max-w-lg text-white/70">
            Pick a deal, start a toly and send the link to your group. When the
            last seat fills, the table is yours.
          </p>
          <Link
            href="#deals"
            className="relative mt-7 inline-flex min-h-[52px] items-center rounded-full bg-primary px-6 font-semibold text-primary-foreground"
          >
            See deals near you
          </Link>
        </section>
      </Container>
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
        <ul className="grid gap-5 sm:grid-cols-2 min-[981px]:grid-cols-3">
          {deals.map((deal) => (
            <li key={deal.id} className="flex flex-col [&>a]:flex-1">
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
  const first = wheels[0];
  const detail = first
    ? await publicApi.api.v1.venues[":slug"].wheel
        .$get({ param: { slug: first.slug } })
        .then((r) => (r.ok ? r.json() : null))
    : null;
  return (
    <section
      id="spin"
      aria-labelledby="spin-heading"
      className="mt-32 grid items-center gap-10 rounded-[36px] bg-card p-10 shadow-1 max-sm:mt-22 max-sm:p-6 min-[981px]:grid-cols-2"
    >
      <div>
        <p className="text-sm font-medium text-accent-foreground">Toly Spin</p>
        <h2
          id="spin-heading"
          className="mt-2 text-h2 font-semibold max-sm:text-[34px]"
        >
          Spin for a discount.
        </h2>
        <p className="mt-4 max-w-prose text-[18px] text-ink-2">
          Pay a small fee, spin the venue's wheel and win a voucher for your
          bill. Every spin wins something. You pay the venue directly for your
          bill.
        </p>
        <ul className="mt-7 space-y-2">
          {wheels.map((w) => (
            <li key={w.slug}>
              <Link
                href={`/spin/${w.slug}`}
                className="flex min-h-16 items-center gap-3 rounded-full bg-secondary px-4 py-2.5 hover:bg-accent"
              >
                <Dices className="size-6 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1">
                  <b className="block text-sm">{w.name}</b>
                  <span className="block text-xs text-ink-2">{w.area}</span>
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {formatRs(w.pricePaisa)} a spin
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-5 flex items-start gap-2 text-[13px] text-muted-foreground">
          <Info className="size-4 shrink-0" aria-hidden />
          Every prize and its exact chance is listed before you pay.
        </p>
      </div>
      {detail ? (
        <div className="min-w-0 py-6">
          <Wheel
            segments={detail.prizes.map((p) => ({
              id: p.id,
              ...segmentLabel(p),
            }))}
            rotation={0}
            spinning={false}
            className="home-wheel"
          />
        </div>
      ) : null}
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
        "inline-flex h-11 shrink-0 items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        active
          ? "border-ink bg-ink text-ink-foreground"
          : "bg-card hover:border-foreground/30",
      )}
    >
      {label}
    </Link>
  );
}

async function FeaturedHero() {
  const deals = await publicApi.api.v1.deals
    .$get({ query: {} })
    .then((r) => (r.ok ? r.json() : []));
  const deal = deals[0];
  return (
    <HomeHero
      signedIn
      accountSlot={
        <Suspense fallback={<span className="size-11" />}>
          <CurrentUserMenu />
        </Suspense>
      }
      featured={
        deal
          ? {
              title: deal.title,
              venueName: deal.merchant.name,
              area: deal.merchant.area,
              price: deal.groupPricePaisa / 100,
              regularPrice: deal.basePricePaisa / 100,
              partySize: deal.partySize,
              members: [],
              href: `/deals/${deal.slug}`,
            }
          : null
      }
    />
  );
}
