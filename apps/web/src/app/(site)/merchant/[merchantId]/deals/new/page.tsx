import { Suspense } from "react";
import { DealForm } from "@/components/merchant/deal-form";
import { Skeleton } from "@/components/ui/skeleton";
import { getMerchant } from "@/lib/merchant";

export default function NewDealPage({
  params,
}: PageProps<"/merchant/[merchantId]/deals/new">) {
  return (
    <section className="space-y-6">
      <h2 className="font-sans text-xl font-semibold [font-variation-settings:normal]">
        New deal
      </h2>
      <Suspense fallback={<Skeleton className="h-96 w-full max-w-2xl" />}>
        <NewDeal params={params} />
      </Suspense>
    </section>
  );
}

async function NewDeal({
  params,
}: Pick<PageProps<"/merchant/[merchantId]/deals/new">, "params">) {
  const { merchantId } = await params;
  return (
    <DealForm merchantId={merchantId} venue={await getMerchant(merchantId)} />
  );
}
