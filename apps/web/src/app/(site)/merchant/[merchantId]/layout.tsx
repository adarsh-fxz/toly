import { Suspense } from "react";
import { MerchantNav } from "@/components/merchant/merchant-nav";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getMerchant } from "@/lib/merchant";

export default function MerchantLayout({
  children,
  params,
}: LayoutProps<"/merchant/[merchantId]">) {
  return (
    <div className="pb-24 min-[981px]:pb-0">
      <Suspense fallback={<HeaderSkeleton />}>
        <VenueHeader params={params} />
      </Suspense>
      <div className="py-8">{children}</div>
    </div>
  );
}

async function VenueHeader({
  params,
}: Pick<LayoutProps<"/merchant/[merchantId]">, "params">) {
  const { merchantId } = await params;
  const merchant = await getMerchant(merchantId);
  return (
    <div className="space-y-5 pt-12 max-sm:pt-7">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-h3 font-semibold max-sm:text-[25px]">
          {merchant.name}
        </h1>
        {merchant.status !== "approved" ? (
          <Badge variant="secondary">Not live yet</Badge>
        ) : null}
      </div>
      <MerchantNav merchantId={merchant.id} role={merchant.role} />
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="space-y-5 pt-12 max-sm:pt-7" aria-hidden>
      <Skeleton className="h-10 w-56" />
      <Skeleton className="hidden h-11 w-80 md:block" />
    </div>
  );
}
