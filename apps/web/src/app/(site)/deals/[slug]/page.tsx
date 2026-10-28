import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DealFacts } from "@/components/deal/deal-facts";
import { ViewBeacon } from "@/components/deal/view-beacon";
import { StartTolyGate } from "@/components/group/start-toly-gate";
import { DealTile } from "@/components/toly/deal-card";
import { SeatRing } from "@/components/toly/seat-ring";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi } from "@/lib/api-server";
import { dealCategory } from "@/lib/deal-view";
import { formatRs, percentOff } from "@/lib/money";
import type { PublicDeal } from "@/lib/types";

async function fetchDeal(slug: string): Promise<PublicDeal | null> {
  const res = await publicApi.api.v1.deals[":slug"].$get({ param: { slug } });
  return res.ok ? res.json() : null;
}

export async function generateMetadata({
  params,
}: PageProps<"/deals/[slug]">): Promise<Metadata> {
  const deal = await fetchDeal((await params).slug);
  if (!deal) return { title: "Deal not found" };
  const description = `${formatRs(deal.groupPricePaisa)} for ${deal.partySize} at ${deal.merchant.name}, ${deal.merchant.area}. Start a toly and unlock it with friends.`;
  return {
    title: `${deal.title} at ${deal.merchant.name}`,
    description,
    openGraph: { title: deal.title, description, type: "website" },
  };
}

export default function DealPage({ params }: PageProps<"/deals/[slug]">) {
  return (
    <Suspense fallback={<DealSkeleton />}>
      <Deal params={params} />
    </Suspense>
  );
}

async function Deal({ params }: Pick<PageProps<"/deals/[slug]">, "params">) {
  const deal = await fetchDeal((await params).slug);
  if (!deal) notFound();
  const off = percentOff(deal.basePricePaisa, deal.groupPricePaisa);
  const available = deal.status === "live";

  return (
    <article className="grid gap-9 py-12 max-sm:py-7 min-[981px]:grid-cols-[minmax(0,1fr)_380px] min-[981px]:gap-x-12">
      {available ? <ViewBeacon slug={deal.slug} /> : null}
      <header className="space-y-4 min-[981px]:col-start-1">
        <Link
          href={`/v/${deal.merchant.slug}`}
          className="inline-block inline-flex min-h-11 items-center text-sm font-medium text-ink-2 underline-offset-4 hover:text-foreground hover:underline"
        >
          {deal.merchant.name}, {deal.merchant.area}
        </Link>
        <h1 className="text-h1 font-semibold max-sm:text-[36px]">
          {deal.title}
        </h1>
        {deal.description ? (
          <p className="max-w-prose text-lg text-muted-foreground">
            {deal.description}
          </p>
        ) : null}
      </header>

      <PriceCard deal={deal} available={available} off={off} />

      <div className="space-y-10 min-[981px]:col-start-1">
        <DealTile
          category={dealCategory(deal.merchant.category)}
          partySize={deal.partySize}
          large
        />
        <section aria-labelledby="included" className="space-y-4">
          <h2
            id="included"
            className="font-sans text-xl font-semibold [font-variation-settings:normal]"
          >
            What's included
          </h2>
          <ul className="space-y-2">
            {deal.includes.map((item) => (
              <li key={item} className="flex gap-3">
                <Check
                  className="mt-1 size-4 shrink-0 text-success"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="when" className="space-y-4">
          <h2
            id="when"
            className="font-sans text-xl font-semibold [font-variation-settings:normal]"
          >
            When and where
          </h2>
          <DealFacts deal={deal} />
        </section>

        {deal.terms ? (
          <section aria-labelledby="terms" className="space-y-2">
            <h2
              id="terms"
              className="font-sans text-xl font-semibold [font-variation-settings:normal]"
            >
              Venue rules
            </h2>
            <p className="max-w-prose whitespace-pre-line text-muted-foreground">
              {deal.terms}
            </p>
          </section>
        ) : null}
      </div>
    </article>
  );
}

function PriceCard({
  deal,
  available,
  off,
}: {
  deal: PublicDeal;
  available: boolean;
  off: number;
}) {
  return (
    <aside className="min-[981px]:col-start-2 min-[981px]:row-span-2 min-[981px]:row-start-1 min-[981px]:sticky min-[981px]:top-[92px] min-[981px]:self-start">
      <div className="space-y-6 rounded-xl bg-card p-7 shadow-2 max-sm:p-[22px]">
        <div className="space-y-1">
          <p className="font-display text-[48px] font-semibold leading-none tracking-[-0.04em] tabular-nums max-sm:text-[40px]">
            {formatRs(deal.groupPricePaisa)}
          </p>
          <p className="text-ink-2">
            for {deal.partySize} people, one bill.{" "}
            <span className="whitespace-nowrap">
              Regular menu price{" "}
              <span className="line-through tabular">
                {formatRs(deal.basePricePaisa)}
              </span>
            </span>
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <SeatRing
              members={[]}
              size={deal.partySize}
              className="origin-left scale-75 -my-6 -mr-12"
            />
            <p className="text-sm text-ink-2">
              {deal.partySize} friends.
              <br />
              One table.
            </p>
          </div>
          <p className="text-sm text-ink-2">
            {available
              ? `Fill all ${deal.partySize} seats within ${deal.formationHours} hours to unlock ${off}% off.`
              : "This deal isn't taking new tolys right now."}
          </p>
        </div>
        {available ? (
          <Suspense
            fallback={<Skeleton className="h-12 w-full bg-secondary" />}
          >
            <StartTolyGate dealSlug={deal.slug} />
          </Suspense>
        ) : null}
        <p className="border-t pt-4 text-sm text-ink-2">
          You pay {deal.merchant.name} directly at the counter. Toly never takes
          payment for the bill.
        </p>
      </div>
    </aside>
  );
}

function DealSkeleton() {
  return (
    <div
      className="grid gap-12 py-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:py-14"
      aria-hidden
    >
      <div className="space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </div>
      <Skeleton className="h-72 rounded-3xl" />
    </div>
  );
}
