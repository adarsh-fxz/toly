import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DealForm } from "@/components/merchant/deal-form";
import { Skeleton } from "@/components/ui/skeleton";
import { serverApi } from "@/lib/api-server";

export default function EditDealPage({
  params,
}: PageProps<"/merchant/[merchantId]/deals/[dealId]">) {
  return (
    <section className="space-y-6">
      <h2 className="font-sans text-xl font-semibold [font-variation-settings:normal]">
        Edit deal
      </h2>
      <p className="max-w-prose text-sm text-muted-foreground">
        Changes apply to new tolys. Groups that already started keep the price
        and terms they joined with.
      </p>
      <Suspense fallback={<Skeleton className="h-96 w-full max-w-2xl" />}>
        <Edit params={params} />
      </Suspense>
    </section>
  );
}

async function Edit({
  params,
}: Pick<PageProps<"/merchant/[merchantId]/deals/[dealId]">, "params">) {
  const { merchantId, dealId } = await params;
  const client = await serverApi();
  const res = await client.api.v1.merchants[":id"].deals[":dealId"].$get({
    param: { id: merchantId, dealId },
  });
  if (!res.ok) notFound();
  return <DealForm merchantId={merchantId} deal={await res.json()} />;
}
