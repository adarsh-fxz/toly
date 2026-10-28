import {
  MERCHANT_CATEGORIES,
  type MerchantCategory,
} from "@toly/shared/merchant";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DealListSkeleton } from "@/components/deal/deal-list-skeleton";
import { DealRow } from "@/components/deal/deal-row";
import { EmptyState } from "@/components/feedback/empty-state";
import { segmentLabel, Wheel } from "@/components/spin/wheel";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi } from "@/lib/api-server";
import { formatRs } from "@/lib/money";

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
      <Link
        href="/#deals"
        className="mb-4 inline-flex min-h-11 items-center text-sm font-medium text-ink-2"
      >
        All deals
      </Link>
      <div className="grid gap-6 min-[61.3125rem]:grid-cols-[minmax(0,1fr)_380px]">
        <header className="space-y-5 rounded-[32px] bg-tint-a p-10 max-sm:p-6">
          <p className="text-sm font-medium text-muted-foreground">
            {MERCHANT_CATEGORIES[venue.category as MerchantCategory]} in{" "}
            {venue.area}
          </p>
          <h1 className="text-h1 font-semibold max-sm:text-[36px]">
            {venue.name}
          </h1>
          <p className="text-muted-foreground">{venue.address}</p>
          {venue.description ? (
            <p className="max-w-prose text-lg">{venue.description}</p>
          ) : null}
        </header>
        {wheel ? (
          <Link
            href={`/spin/${venue.slug}`}
            className="night flex flex-col items-start justify-center gap-5 rounded-[32px] p-8 transition-transform focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.99] "
          >
            <Wheel
              segments={wheel.prizes.map((p) => ({
                id: p.id,
                ...segmentLabel(p),
              }))}
              rotation={0}
              spinning={false}
              className="!w-36 !max-w-full self-center"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-bold">Toly Spin</span>
              <span className="block text-sm">
                {formatRs(wheel.pricePaisa)} a spin. Every spin wins a discount
                here.
              </span>
            </span>
            <span className="font-semibold">Spin</span>
          </Link>
        ) : null}
      </div>
      <section aria-labelledby="venue-deals" className="mt-12 space-y-4">
        <h2 id="venue-deals" className="text-h3 font-semibold">
          Group deals
        </h2>
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
