import {
  MERCHANT_CATEGORIES,
  type MerchantCategory,
} from "@toly/shared/merchant";
import { MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryIcon } from "@/components/deal/category-icon";
import { DealListSkeleton } from "@/components/deal/deal-list-skeleton";
import { DealRow } from "@/components/deal/deal-row";
import { EmptyState } from "@/components/feedback/empty-state";
import { BackLink } from "@/components/layout/back-link";
import { Wheel } from "@/components/spin/wheel";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi } from "@/lib/api-server";
import { formatRs } from "@/lib/money";
import { segmentLabel } from "@/lib/spin-view";

async function fetchVenue(slug: string) {
  const res = await publicApi.api.v1.venues[":slug"].$get({ param: { slug } });
  return res.ok ? res.json() : null;
}

export async function generateMetadata({
  params,
}: PageProps<"/v/[slug]">): Promise<Metadata> {
  const venue = await fetchVenue((await params).slug);
  if (!venue) return { title: "Venue not found" };
  return {
    title: `${venue.name}, ${venue.area}`,
    description: venue.description || `Group deals at ${venue.name} on Toly.`,
  };
}

export default function VenuePage({ params }: PageProps<"/v/[slug]">) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 py-10" aria-hidden>
          <Skeleton className="h-14 w-72" />
          <DealListSkeleton rows={2} />
        </div>
      }
    >
      <Venue params={params} />
    </Suspense>
  );
}

async function Venue({ params }: Pick<PageProps<"/v/[slug]">, "params">) {
  const { slug } = await params;
  const [venue, wheel] = await Promise.all([
    fetchVenue(slug),
    publicApi.api.v1.venues[":slug"].wheel
      .$get({ param: { slug } })
      .then((r) => (r.ok ? r.json() : null)),
  ]);
  if (!venue) notFound();

  return (
    <div className="py-12 max-sm:py-7">
      <BackLink href="/#deals" className="mb-4">
        All deals
      </BackLink>
      <div className="grid gap-6 min-[61.3125rem]:grid-cols-[minmax(0,1fr)_380px]">
        <header className="flex flex-col gap-[18px] rounded-[32px] bg-tint-a p-10 max-sm:p-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="grid size-[72px] place-items-center rounded-[22px] bg-card shadow-1">
              <CategoryIcon category={venue.category} className="size-8" />
            </span>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="h-[26px] px-2.5 text-[13px]"
              >
                {MERCHANT_CATEGORIES[venue.category as MerchantCategory]}
              </Badge>
              <Badge
                variant="secondary"
                className="h-[26px] px-2.5 text-[13px]"
              >
                {venue.area}
              </Badge>
            </div>
          </div>
          <h1 className="text-h1 font-[650] max-[980px]:text-[46px] max-sm:text-[36px]">
            {venue.name}
          </h1>
          <p className="flex items-start gap-2 text-ink-2">
            <MapPin className="mt-1 size-[18px] shrink-0" aria-hidden />
            {venue.address}
          </p>
          {venue.description ? (
            <p className="max-w-[36em] text-lg leading-[1.55] text-ink-2">
              {venue.description}
            </p>
          ) : null}
        </header>
        {wheel ? (
          <aside
            className="night flex flex-col justify-between gap-[18px] rounded-[32px] p-8 max-sm:p-6"
            aria-labelledby="venue-spin-heading"
          >
            <Wheel
              size="compact"
              segments={wheel.prizes.map((p) => ({
                id: p.id,
                ...segmentLabel(p),
              }))}
              rotation={0}
              spinning={false}
            />
            <div>
              <p className="text-sm font-medium text-[#F6BA5E]">Toly Spin</p>
              <h2
                id="venue-spin-heading"
                className="mt-1 font-display text-[22px] font-semibold leading-[1.2] tracking-[-.025em] text-[#F3F1EC]"
              >
                {formatRs(wheel.pricePaisa)} a spin. Every spin wins a discount
                here.
              </h2>
            </div>
            <Link
              href={`/spin/${venue.slug}`}
              className={buttonVariants({
                size: "lg",
                className: "h-14 w-full px-7 text-[17px]",
              })}
            >
              See prizes and spin
            </Link>
          </aside>
        ) : null}
      </div>
      <section aria-labelledby="venue-deals" className="mt-12 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="venue-deals" className="text-h3 font-semibold">
            Group deals here
          </h2>
          <p className="text-sm text-muted-foreground">
            Prices are for the whole table. You pay the venue directly.
          </p>
        </div>
        {venue.deals.length === 0 ? (
          <EmptyState
            title="No deals running right now"
            body="Check back soon for the next table to fill."
          />
        ) : (
          <ul className="kit-list grid gap-5 sm:grid-cols-2 min-[61.3125rem]:grid-cols-3">
            {venue.deals.map((deal) => (
              <li key={deal.id}>
                <DealRow deal={deal} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
