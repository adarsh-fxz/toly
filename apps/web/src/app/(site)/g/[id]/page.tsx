import { formatRs } from "@toly/shared/money";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SeatDots } from "@/components/brand/seat-dots";
import { AutoRefresh } from "@/components/group/auto-refresh";
import { Countdown } from "@/components/group/countdown";
import { ShareToly } from "@/components/group/share-toly";
import { JoinToly, LeaveToly } from "@/components/group/toly-actions";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { serverApi } from "@/lib/api-server";
import { formatDay } from "@/lib/dates";
import { getCurrentUser } from "@/lib/session";
import type { GroupView } from "@/lib/types";

export const metadata: Metadata = {
  title: "Join my toly",
  description: "Fill the seats and unlock the group price together.",
};

export default function TolyPage({ params }: PageProps<"/g/[id]">) {
  return (
    <Suspense fallback={<TolySkeleton />}>
      <Toly params={params} />
    </Suspense>
  );
}

async function Toly({ params }: Pick<PageProps<"/g/[id]">, "params">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const client = await serverApi();
  const res = await client.api.v1.groups[":id"].$get({ param: { id } });
  if (!res.ok) notFound();
  const group = await res.json();
  const filled = group.members.length;
  const left = group.partySize - filled;
  const { deal } = group;

  const headline = {
    forming: `${filled} in. ${left} ${left === 1 ? "seat" : "seats"} left.`,
    unlocked: "Unlocked. Enjoy!",
    expired: "This toly ran out of time.",
    cancelled: "This toly was cancelled.",
  }[group.status];

  return (
    <div className="grid gap-10 py-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-x-12 md:py-14">
      {group.status === "forming" ? <AutoRefresh /> : null}
      <section className="space-y-8">
        <div className="space-y-3">
          <Link
            href={`/deals/${deal.dealSlug}`}
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {deal.title} at {deal.merchantName}
          </Link>
          <h1
            className="text-5xl font-extrabold md:text-7xl"
            aria-live="polite"
          >
            {headline}
          </h1>
          {group.status === "forming" ? (
            <p className="text-muted-foreground">
              Closes in <Countdown until={String(group.expiresAt)} /> if the
              seats aren't filled.
            </p>
          ) : null}
        </div>

        <div className="space-y-5">
          <SeatDots filled={filled} total={group.partySize} size="lg" />
          <ol className="flex flex-wrap gap-x-6 gap-y-2">
            {group.members.map((m, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: members are listed in join order
              <li key={i} className="font-medium">
                {m.isYou ? "You" : m.name}
                {m.isOrganizer ? (
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    (started it)
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>

        <dl className="grid gap-4 border-t pt-6 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-muted-foreground">
              Price for the table
            </dt>
            <dd className="text-lg font-semibold tabular">
              {formatRs(deal.groupPricePaisa)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Where</dt>
            <dd className="font-medium">
              {deal.merchantName}, {deal.merchantArea}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Planned for</dt>
            <dd className="font-medium">
              {group.plannedFor ? formatDay(group.plannedFor) : "Not decided"}
            </dd>
          </div>
        </dl>
      </section>

      <aside className="space-y-4 md:sticky md:top-24 md:self-start">
        <Suspense fallback={<Skeleton className="h-28 w-full" />}>
          <Actions group={group} left={left} />
        </Suspense>
      </aside>
    </div>
  );
}

async function Actions({ group, left }: { group: GroupView; left: number }) {
  const { deal, viewer } = group;

  if (group.status === "unlocked") {
    return viewer.isMember && group.voucherId ? (
      <div className="space-y-3 rounded-3xl bg-success p-6 text-success-foreground">
        <p className="text-lg font-semibold">The group price is yours.</p>
        <p className="text-sm opacity-90">
          Show the voucher at the counter, then pay {deal.merchantName}{" "}
          directly.
        </p>
        <Link
          href={`/vouchers/${group.voucherId}`}
          className={buttonVariants({
            size: "lg",
            variant: "secondary",
            className: "w-full",
          })}
        >
          Open voucher
        </Link>
      </div>
    ) : (
      <StartOwn slug={deal.dealSlug} note="This toly is full." />
    );
  }

  if (group.status !== "forming")
    return <StartOwn slug={deal.dealSlug} note="You can start a fresh one." />;

  if (viewer.isMember) {
    const message = `Join my toly for ${deal.title} at ${deal.merchantName}: ${formatRs(deal.groupPricePaisa)} for ${group.partySize}. ${left} ${left === 1 ? "seat" : "seats"} left.`;
    return (
      <div className="space-y-4 rounded-3xl border bg-card p-6">
        <p className="font-semibold">Send the link to your friends</p>
        <ShareToly groupId={group.id} message={message} />
        <LeaveToly groupId={group.id} isOrganizer={viewer.isOrganizer} />
      </div>
    );
  }

  const user = await getCurrentUser();
  const next = encodeURIComponent(`/g/${group.id}`);
  return (
    <div className="space-y-4 rounded-3xl border bg-card p-6">
      <p className="font-semibold">You're invited</p>
      <p className="text-sm text-muted-foreground">
        Take a seat. When all {group.partySize} are filled, the group pays{" "}
        {formatRs(deal.groupPricePaisa)} at {deal.merchantName}, one bill for
        the table.
      </p>
      {!user ? (
        <Link
          href={`/sign-in?next=${next}`}
          className={buttonVariants({ size: "lg", className: "w-full" })}
        >
          Sign in to join
        </Link>
      ) : !user.phoneNumberVerified ? (
        <Link
          href="/account"
          className={buttonVariants({ size: "lg", className: "w-full" })}
        >
          Verify your number to join
        </Link>
      ) : (
        <JoinToly groupId={group.id} />
      )}
    </div>
  );
}

function StartOwn({ slug, note }: { slug: string; note: string }) {
  return (
    <div className="space-y-4 rounded-3xl border bg-card p-6">
      <p className="text-muted-foreground">{note}</p>
      <Link
        href={`/deals/${slug}`}
        className={buttonVariants({ size: "lg", className: "w-full" })}
      >
        Start your own toly
      </Link>
    </div>
  );
}

function TolySkeleton() {
  return (
    <div className="space-y-6 py-10" aria-hidden>
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-16 w-full max-w-xl" />
      <Skeleton className="h-10 w-64" />
    </div>
  );
}
