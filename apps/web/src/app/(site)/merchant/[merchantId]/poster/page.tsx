import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Poster } from "@/components/merchant/poster";
import { Skeleton } from "@/components/ui/skeleton";
import { getMerchant } from "@/lib/merchant";

export default function PosterPage({
  params,
}: PageProps<"/merchant/[merchantId]/poster">) {
  return (
    <Suspense
      fallback={
        <Skeleton className="mx-auto aspect-[1/1.414] w-full max-w-md" />
      }
    >
      <PosterFor params={params} />
    </Suspense>
  );
}

async function PosterFor({
  params,
}: Pick<PageProps<"/merchant/[merchantId]/poster">, "params">) {
  const { merchantId } = await params;
  const merchant = await getMerchant(merchantId);
  if (merchant.role !== "owner" || merchant.status !== "approved") notFound();
  return <Poster name={merchant.name} slug={merchant.slug} />;
}
