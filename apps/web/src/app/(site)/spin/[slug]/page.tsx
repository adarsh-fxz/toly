import { describeValidity } from "@toly/shared/deal";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SpinPlayer } from "@/components/spin/spin-player";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi, serverApi } from "@/lib/api-server";
import { getCurrentUser } from "@/lib/session";
import { describeOffer } from "@/lib/voucher";

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
    <div className="grid gap-8 py-12 max-sm:py-7 min-[61.3125rem]:grid-cols-2 min-[61.3125rem]:items-start min-[61.3125rem]:gap-x-14">
      <header className="space-y-4 min-[61.3125rem]:col-start-2">
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
      <div className="min-[61.3125rem]:sticky min-[61.3125rem]:top-24 min-[61.3125rem]:col-start-1 min-[61.3125rem]:row-span-2 min-[61.3125rem]:row-start-1">
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
        />
      </div>
      <section
        aria-labelledby="odds"
        className="space-y-3 min-[61.3125rem]:col-start-2"
      >
        <h2
          id="odds"
          className="font-sans text-lg font-semibold [font-variation-settings:normal]"
        >
          Prizes and chances
        </h2>
        <ul className="divide-y overflow-hidden rounded-xl bg-card px-5 shadow-1">
          {wheel.prizes.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <span className="min-w-0">
                <span className="block font-medium">{p.label}</span>
                <span className="block text-sm text-muted-foreground">
                  {describeOffer(p)}
                </span>
              </span>
              <span className="text-right text-sm tabular">
                <span className="block font-semibold">{p.odds}%</span>
                {p.limited ? (
                  <span className="block text-muted-foreground">
                    while today's stock lasts
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          These are the chances for each prize. When a limited prize runs out
          for the day, its chance moves to the others. You pay the venue
          directly for your bill. The spin fee is paid to Toly and isn't
          refundable once you've spun.
        </p>
      </section>
    </div>
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
