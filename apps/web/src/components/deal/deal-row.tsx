import { describeDays } from "@toly/shared/deal";
import { formatRs, percentOff } from "@toly/shared/money";
import Link from "next/link";
import { SeatDots } from "@/components/brand/seat-dots";
import type { PublicDeal } from "@/lib/types";
import { CategoryIcon } from "./category-icon";

export function DealRow({ deal }: { deal: PublicDeal }) {
  const off = percentOff(deal.basePricePaisa, deal.groupPricePaisa);
  return (
    <Link
      href={`/deals/${deal.slug}`}
      className="group grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-4 gap-y-2 rounded-2xl px-3 py-5 transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:px-4"
    >
      <span className="row-span-2 grid size-12 place-items-center rounded-xl bg-secondary text-secondary-foreground">
        <CategoryIcon category={deal.merchant.category} className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-lg font-semibold leading-snug group-hover:underline group-hover:decoration-primary group-hover:underline-offset-4">
          {deal.title}
        </span>
        <span className="block truncate text-sm text-muted-foreground">
          {deal.merchant.name}, {deal.merchant.area}
        </span>
      </span>
      <span className="text-right">
        <span className="block text-lg font-bold tabular">
          {formatRs(deal.groupPricePaisa)}
        </span>
        <span className="block text-sm text-muted-foreground line-through tabular">
          {formatRs(deal.basePricePaisa)}
        </span>
      </span>
      <span className="col-span-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <SeatDots filled={0} total={deal.partySize} size="sm" />
          {deal.partySize} people
        </span>
        <span>{describeDays(deal.availableDays)}</span>
        {off > 0 ? (
          <span className="font-medium text-primary">{off}% off together</span>
        ) : null}
      </span>
    </Link>
  );
}
