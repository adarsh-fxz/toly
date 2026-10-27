import { notFound } from "next/navigation";
import { Suspense } from "react";
import { WheelEditor } from "@/components/merchant/wheel-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { serverApi } from "@/lib/api-server";
import { getMerchant } from "@/lib/merchant";

export default function SpinSettingsPage({
  params,
}: PageProps<"/merchant/[merchantId]/spin">) {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-sans text-xl font-semibold [font-variation-settings:normal]">
          Toly Spin
        </h2>
        <p className="max-w-prose text-sm text-muted-foreground">
          Customers pay a small fee to spin your wheel and win a discount
          voucher for your venue. It brings people in for a reason to visit
          today.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <Editor params={params} />
      </Suspense>
    </section>
  );
}

async function Editor({
  params,
}: Pick<PageProps<"/merchant/[merchantId]/spin">, "params">) {
  const { merchantId } = await params;
  const [merchant, res] = await Promise.all([
    getMerchant(merchantId),
    serverApi().then((c) =>
      c.api.v1.merchants[":id"].wheel.$get({ param: { id: merchantId } }),
    ),
  ]);
  if (!res.ok) notFound();
  return (
    <WheelEditor
      merchantId={merchantId}
      saved={await res.json()}
      approved={merchant.status === "approved"}
    />
  );
}
