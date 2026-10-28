import { describeDays } from "@toly/shared/deal";
import { Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DealStatusActions } from "@/components/merchant/deal-status-actions";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { serverApi } from "@/lib/api-server";
import { getMerchant } from "@/lib/merchant";
import { formatRs } from "@/lib/money";

const statusLabel: Record<string, string> = {
  draft: "Draft",
  live: "Live",
  paused: "Paused",
  ended: "Ended",
};

export default function DealsPage({
  params,
}: PageProps<"/merchant/[merchantId]/deals">) {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <Deals params={params} />
    </Suspense>
  );
}

async function Deals({
  params,
}: Pick<PageProps<"/merchant/[merchantId]/deals">, "params">) {
  const { merchantId } = await params;
  const [merchant, res] = await Promise.all([
    getMerchant(merchantId),
    serverApi().then((c) =>
      c.api.v1.merchants[":id"].deals.$get({ param: { id: merchantId } }),
    ),
  ]);
  if (!res.ok) notFound();
  const deals = await res.json();
  const isOwner = merchant.role === "owner";

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-sans text-xl font-semibold [font-variation-settings:normal]">
          Deals
        </h2>
        {isOwner ? (
          <Link
            href={`/merchant/${merchantId}/deals/new`}
            className={buttonVariants()}
          >
            <Plus aria-hidden />
            New deal
          </Link>
        ) : null}
      </div>
      {merchant.status !== "approved" ? (
        <p className="rounded-xl bg-secondary px-4 py-3 text-sm">
          You can prepare deals now. They go live once we've approved your
          venue.
        </p>
      ) : null}
      {deals.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-6 py-14 text-center">
          <p className="font-semibold">No deals yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Start with one bundle for your quietest hours, like a weekday
            afternoon set for four.
          </p>
          {isOwner ? (
            <Link
              href={`/merchant/${merchantId}/deals/new`}
              className={buttonVariants({ className: "mt-5" })}
            >
              Create your first deal
            </Link>
          ) : null}
        </div>
      ) : (
        <ul className="grid gap-5 min-[981px]:grid-cols-2">
          {deals.map((deal) => (
            <li
              key={deal.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-card p-6 shadow-1"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-h4 font-semibold">
                    {deal.title}
                  </p>
                  <Badge
                    variant={deal.status === "live" ? "default" : "secondary"}
                  >
                    {statusLabel[deal.status]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="tabular">
                    {formatRs(deal.groupPricePaisa)}
                  </span>{" "}
                  for {deal.partySize}, {describeDays(deal.availableDays)}
                </p>
              </div>
              {isOwner ? (
                <div className="flex flex-wrap gap-2">
                  {deal.status === "live" ? (
                    <Link
                      href={`/deals/${deal.slug}`}
                      className={buttonVariants({
                        size: "sm",
                        variant: "ghost",
                      })}
                    >
                      View
                    </Link>
                  ) : null}
                  <Link
                    href={`/merchant/${merchantId}/deals/${deal.id}`}
                    className={buttonVariants({
                      size: "sm",
                      variant: "outline",
                    })}
                  >
                    Edit
                  </Link>
                  <DealStatusActions
                    merchantId={merchantId}
                    dealId={deal.id}
                    status={deal.status}
                    canPublish={merchant.status === "approved"}
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
