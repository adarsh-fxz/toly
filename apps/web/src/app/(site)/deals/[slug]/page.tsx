import { formatRs, percentOff } from "@toly/shared/money";
import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SeatDots } from "@/components/brand/seat-dots";
import { DealFacts } from "@/components/deal/deal-facts";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi } from "@/lib/api-server";
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
    <article className="grid gap-10 py-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-x-12 md:py-14">
      <header className="space-y-4 md:col-start-1">
        <Link
          href={`/v/${deal.merchant.slug}`}
          className="inline-block text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {deal.merchant.name}, {deal.merchant.area}
        </Link>
        <h1 className="text-5xl font-extrabold md:text-7xl">{deal.title}</h1>
        {deal.description ? (
          <p className="max-w-prose text-lg text-muted-foreground">
            {deal.description}
          </p>
        ) : null}
      </header>

      <PriceCard deal={deal} available={available} off={off} />

      <div className="space-y-10 md:col-start-1">
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
    <aside className="md:col-start-2 md:row-span-2 md:row-start-1 md:sticky md:top-24 md:self-start">
      <div className="space-y-6 rounded-3xl bg-ink p-6 text-ink-foreground md:p-8 dark:border dark:bg-card dark:text-card-foreground">
        <div className="space-y-1">
          <p className="font-display text-6xl font-extrabold tabular font-condensed">
            {formatRs(deal.groupPricePaisa)}
          </p>
          <p className="text-ink-foreground/80 dark:text-muted-foreground">
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
          <SeatDots filled={0} total={deal.partySize} size="lg" />
          <p className="text-sm text-ink-foreground/80 dark:text-muted-foreground">
            {available
              ? `Fill all ${deal.partySize} seats within ${deal.formationHours} hours to unlock ${off}% off.`
              : "This deal isn't taking new tolys right now."}
          </p>
        </div>
        <p className="border-t border-ink-foreground/15 pt-4 text-sm text-ink-foreground/80 dark:border-border dark:text-muted-foreground">
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
