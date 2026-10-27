import {
  MERCHANT_CATEGORIES,
  type MerchantCategory,
} from "@toly/shared/merchant";
import { formatRs } from "@toly/shared/money";
import { Dices } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DealListSkeleton } from "@/components/deal/deal-list-skeleton";
import { DealRow } from "@/components/deal/deal-row";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi } from "@/lib/api-server";

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
    <div className="py-10 md:py-14">
      <header className="max-w-3xl space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          {MERCHANT_CATEGORIES[venue.category as MerchantCategory]} in{" "}
          {venue.area}
        </p>
        <h1 className="text-5xl font-extrabold md:text-7xl">{venue.name}</h1>
        <p className="text-muted-foreground">{venue.address}</p>
        {venue.description ? (
          <p className="max-w-prose text-lg">{venue.description}</p>
        ) : null}
      </header>
      {wheel ? (
        <Link
          href={`/spin/${venue.slug}`}
          className="mt-10 flex items-center gap-4 rounded-3xl bg-prize p-5 text-prize-foreground transition-transform focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.99] sm:max-w-xl"
        >
          <Dices className="size-8 shrink-0" aria-hidden />
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
      <section aria-labelledby="venue-deals" className="mt-12 space-y-4">
        <h2 id="venue-deals" className="text-3xl font-extrabold">
          Group deals
        </h2>
        {venue.deals.length === 0 ? (
          <p className="text-muted-foreground">
            No deals running right now. Check back soon.
          </p>
        ) : (
          <ul className="divide-y border-y">
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
