import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TeamManager } from "@/components/merchant/team-manager";
import { Skeleton } from "@/components/ui/skeleton";
import { serverApi } from "@/lib/api-server";

export default function TeamPage({
  params,
}: PageProps<"/merchant/[merchantId]/team">) {
  return (
    <section className="space-y-6">
      <h2 className="font-sans text-xl font-semibold [font-variation-settings:normal]">
        Team
      </h2>
      <Suspense fallback={<Skeleton className="h-48 w-full max-w-2xl" />}>
        <Team params={params} />
      </Suspense>
    </section>
  );
}

async function Team({
  params,
}: Pick<PageProps<"/merchant/[merchantId]/team">, "params">) {
  const { merchantId } = await params;
  const client = await serverApi();
  const res = await client.api.v1.merchants[":id"].team.$get({
    param: { id: merchantId },
  });
  if (!res.ok) notFound();
  return <TeamManager merchantId={merchantId} members={await res.json()} />;
}
