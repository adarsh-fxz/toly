import { Printer, ScanLine } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Insights } from "@/components/insights/insights";
import { VenueForm } from "@/components/merchant/venue-form";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { serverApi } from "@/lib/api-server";
import { getMerchant } from "@/lib/merchant";

type Props = PageProps<"/merchant/[merchantId]">;

export default function MerchantOverviewPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <Overview params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Overview({
  params,
  searchParams,
}: Pick<Props, "params" | "searchParams">) {
  const [{ merchantId }, { days }] = await Promise.all([params, searchParams]);
  const merchant = await getMerchant(merchantId);
  const isOwner = merchant.role === "owner";

  return (
    <div className="space-y-14">
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/merchant/${merchant.id}/scan`}
          className={buttonVariants({ size: "lg" })}
        >
          <ScanLine aria-hidden />
          Scan a voucher
        </Link>
        {isOwner && merchant.status === "approved" ? (
          <Link
            href={`/merchant/${merchant.id}/poster`}
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            <Printer aria-hidden />
            Counter poster
          </Link>
        ) : null}
      </div>

      {isOwner ? (
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <VenueInsights
            merchantId={merchant.id}
            days={days === "7" ? 7 : days === "90" ? 90 : 30}
          />
        </Suspense>
      ) : null}

      <section className="space-y-6 rounded-xl bg-card p-7 shadow-1">
        <div className="space-y-1">
          <h2 className="font-display text-h4 font-semibold">Venue details</h2>
          <p className="text-sm text-muted-foreground">
            Customers see these on every deal you publish.
          </p>
        </div>
        {isOwner ? (
          <VenueForm venue={merchant} />
        ) : (
          <p>
            {merchant.address}, {merchant.area}
          </p>
        )}
      </section>
    </div>
  );
}

async function VenueInsights({
  merchantId,
  days,
}: {
  merchantId: string;
  days: 7 | 30 | 90;
}) {
  const client = await serverApi();
  const res = await client.api.v1.merchants[":id"].insights.$get({
    param: { id: merchantId },
    query: { days: String(days) },
  });
  if (!res.ok) return null;
  return <Insights data={await res.json()} merchantId={merchantId} />;
}
