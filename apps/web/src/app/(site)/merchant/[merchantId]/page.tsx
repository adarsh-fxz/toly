import { ScanLine } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { VenueForm } from "@/components/merchant/venue-form";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getMerchant } from "@/lib/merchant";

export default function MerchantOverviewPage({
  params,
}: PageProps<"/merchant/[merchantId]">) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-xl" />}>
      <Overview params={params} />
    </Suspense>
  );
}

async function Overview({
  params,
}: Pick<PageProps<"/merchant/[merchantId]">, "params">) {
  const { merchantId } = await params;
  const merchant = await getMerchant(merchantId);

  return (
    <div className="space-y-12">
      <Link
        href={`/merchant/${merchant.id}/scan`}
        className={buttonVariants({
          size: "lg",
          className: "w-full sm:w-auto",
        })}
      >
        <ScanLine aria-hidden />
        Scan a voucher
      </Link>
      <section className="max-w-xl space-y-6">
        <div className="space-y-1">
          <h2 className="font-sans text-xl font-semibold [font-variation-settings:normal]">
            Venue details
          </h2>
          <p className="text-sm text-muted-foreground">
            Customers see these on every deal you publish.
          </p>
        </div>
        {merchant.role === "owner" ? (
          <VenueForm venue={merchant} />
        ) : (
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-muted-foreground">Address</dt>
              <dd>{merchant.address}</dd>
            </div>
          </dl>
        )}
      </section>
    </div>
  );
}
