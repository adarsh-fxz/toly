import { describeValidity } from "@toly/shared/deal";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PrizeOdds } from "@/components/spin/prize-odds";
import { SpinPlayer } from "@/components/spin/spin-player";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi, serverApi } from "@/lib/api-server";
import { getCurrentUser } from "@/lib/session";
import { prizeView } from "@/lib/spin-view";

export const metadata: Metadata = { title: "Toly Spin" };

export default function SpinPage({
  params,
  searchParams,
}: PageProps<"/spin/[slug]">) {
  return (
    <Suspense fallback={<SpinSkeleton />}>
      <Spin params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Spin({
  params,
  searchParams,
}: Pick<PageProps<"/spin/[slug]">, "params" | "searchParams">) {
  const [{ slug }, { spin }] = await Promise.all([params, searchParams]);
  const res = await publicApi.api.v1.venues[":slug"].wheel.$get({
    param: { slug },
  });
  if (!res.ok) notFound();
  const wheel = await res.json();
  const user = await getCurrentUser();

  // A paid spin that hasn't been played yet (back from checkout, or the tab was closed).
  let readySpinId: string | null = null;
  if (user && typeof spin === "string" && /^[0-9a-f-]{36}$/i.test(spin)) {
    const client = await serverApi();
    const spinRes = await client.api.v1.spins[":id"].$get({
      param: { id: spin },
    });
    if (spinRes.ok) {
      const state = await spinRes.json();
      if (state.status === "paid") readySpinId = state.id;
    }
  }

  return (
    <SpinPlayer
      wheel={wheel}
      readySpinId={readySpinId}
      canSpin={Boolean(user?.phoneNumberVerified)}
      gateLabel={user ? "Verify your number to spin" : "Sign in to spin"}
      signInHref={
        user
          ? "/account"
          : `/sign-in?next=${encodeURIComponent(`/spin/${slug}`)}`
      }
      intro={
        <header className="space-y-4">
          <Link
            href={`/v/${wheel.merchant.slug}`}
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {wheel.merchant.name}, {wheel.merchant.area}
          </Link>
          <h1 className="text-h1 font-semibold max-sm:text-[36px]">
            Spin for a discount
          </h1>
          <p className="max-w-prose text-lg text-muted-foreground">
            Every spin wins. Prizes are vouchers you redeem at{" "}
            {wheel.merchant.name}. {describeValidity(wheel.validityDays)}.
          </p>
        </header>
      }
      odds={<PrizeOdds prizes={wheel.prizes.map(prizeView)} />}
    />
  );
}

function SpinSkeleton() {
  return (
    <div className="grid gap-10 py-10 min-[61.3125rem]:grid-cols-2" aria-hidden>
      <Skeleton className="mx-auto aspect-square w-full max-w-sm rounded-full" />
      <div className="space-y-4">
        <Skeleton className="h-14 w-3/4" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
