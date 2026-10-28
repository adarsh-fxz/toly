import { Dices, Info } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { DealBrowser, selectedCategory } from "@/components/deal/deal-browser";
import { DealListSkeleton } from "@/components/deal/deal-list-skeleton";
import { ClosingCta } from "@/components/home/closing-cta";
import { HomeHero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Container } from "@/components/layout/container";
import { CurrentUserMenu } from "@/components/site-header";
import { WheelDemo } from "@/components/spin/wheel-demo";
import { publicApi } from "@/lib/api-server";
import { formatRs } from "@/lib/money";

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
          className="space-y-7"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2
              id="deals-heading"
              className="text-h2 font-semibold max-sm:text-[34px]"
            >
              Priced for the whole table.
            </h2>
            <Link
              href="/deals"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-ink-2 hover:bg-secondary"
            >
              View all deals
            </Link>
          </div>
          <Suspense fallback={<DealListSkeleton />}>
            <Deals searchParams={searchParams} />
          </Suspense>
        </section>

        <Suspense fallback={null}>
          <SpinVenues />
        </Suspense>
        <ClosingCta />
      </Container>
    </>
  );
}

async function Deals({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const { category } = await searchParams;
  return <DealBrowser category={selectedCategory(category)} preview />;
}

async function SpinVenues() {
  const wheels = await publicApi.api.v1.wheels
    .$get()
    .then((r) => (r.ok ? r.json() : []));
  if (wheels.length === 0) return null;
  return (
    <section
      id="spin"
      aria-labelledby="spin-heading"
      className="mt-32 grid items-center gap-10 rounded-[36px] bg-card p-10 shadow-1 max-sm:mt-22 max-sm:p-6 min-[61.3125rem]:grid-cols-2"
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
          Example wheel shown. Every venue lists its own prizes and exact
          chances before you pay.
        </p>
      </div>
      <div className="min-w-0 py-6">
        <WheelDemo />
      </div>
    </section>
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
              members: [
                "Aashma",
                "Prabin",
                "Sujan",
                "Nima",
                "Bina",
                "Yuna",
                "Pema",
                "Anish",
                "Rojina",
              ]
                .slice(0, deal.partySize - 1)
                .map((firstName, i) => ({
                  id: `illustration-${i}`,
                  firstName,
                })),
              href: `/deals/${deal.slug}`,
            }
          : null
      }
    />
  );
}
