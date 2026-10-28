import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Scanner } from "@/components/merchant/scanner";
import { Skeleton } from "@/components/ui/skeleton";
import { serverApi } from "@/lib/api-server";
import { formatDateTime } from "@/lib/dates";
import { formatRs } from "@/lib/money";

export default function ScanPage({
  params,
}: PageProps<"/merchant/[merchantId]/scan">) {
  return (
    <div className="space-y-12">
      <Suspense
        fallback={
          <Skeleton className="aspect-square w-full max-w-md rounded-3xl" />
        }
      >
        <ScannerFor params={params} />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        <Recent params={params} />
      </Suspense>
    </div>
  );
}

async function ScannerFor({
  params,
}: Pick<PageProps<"/merchant/[merchantId]/scan">, "params">) {
  const { merchantId } = await params;
  return <Scanner merchantId={merchantId} />;
}

async function Recent({
  params,
}: Pick<PageProps<"/merchant/[merchantId]/scan">, "params">) {
  const { merchantId } = await params;
  const client = await serverApi();
  const res = await client.api.v1.merchants[":id"].redemptions.$get({
    param: { id: merchantId },
  });
  if (!res.ok) notFound();
  const rows = await res.json();

  return (
    <section aria-labelledby="recent" className="space-y-3">
      <h2
        id="recent"
        className="font-sans text-lg font-semibold [font-variation-settings:normal]"
      >
        Recent redemptions
      </h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing redeemed yet. Your first scan will show up here.
        </p>
      ) : (
        <ul className="divide-y border-y">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap justify-between gap-2 py-3 text-sm"
            >
              <span className="font-medium">{r.title}</span>
              <span className="text-muted-foreground">
                {r.redeemedAt ? formatDateTime(r.redeemedAt) : null}
                {r.billAmountPaisa
                  ? `, bill ${formatRs(r.billAmountPaisa)}`
                  : null}
                {r.staffName ? `, by ${r.staffName.split(" ")[0]}` : null}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
