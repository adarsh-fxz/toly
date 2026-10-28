import { ArrowLeft, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AutoRefresh } from "@/components/group/auto-refresh";
import { Countdown } from "@/components/group/countdown";
import { ShareToly } from "@/components/group/share-toly";
import { StatusHeadline } from "@/components/group/status-headline";
import { JoinToly, LeaveToly } from "@/components/group/toly-actions";
import { UnlockMoment } from "@/components/group/unlock-moment";
import { SeatTable } from "@/components/toly/seat-table";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { serverApi } from "@/lib/api-server";
import { formatDay } from "@/lib/dates";
import { formatRs } from "@/lib/money";
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
    <div className="grid grid-cols-1 gap-10 py-12 max-sm:py-7 min-[61.3125rem]:grid-cols-[minmax(0,1fr)_380px] min-[61.3125rem]:gap-x-12">
      {group.status === "forming" ? <AutoRefresh /> : null}
      <section className="min-w-0 space-y-8">
        <div className="space-y-3">
          <Link
            href={`/deals/${deal.dealSlug}`}
            className="inline-flex min-h-11 items-center text-sm font-medium text-ink-2 underline-offset-4 hover:text-foreground hover:underline"
          >
            <ArrowLeft className="mr-2 size-4" aria-hidden />
            {deal.title} at {deal.merchantName}
          </Link>
          <StatusHeadline>{headline}</StatusHeadline>
          {group.status === "forming" ? (
            <p className="text-muted-foreground">
              Closes in <Countdown until={String(group.expiresAt)} /> if the
              seats aren't filled.
            </p>
          ) : null}
        </div>

        <div className="relative overflow-hidden rounded-[32px] bg-card px-2 py-6 shadow-1">
          {group.status === "unlocked" ? (
            <UnlockMoment groupId={group.id} />
          ) : null}
          <SeatTable
            members={group.members.map((m, i) => ({
              id: `${group.id}-${i}-${m.name}`,
              firstName: m.name,
              isYou: m.isYou,
              isOrganiser: m.isOrganizer,
            }))}
            size={group.partySize}
            status={group.status}
          >
            {group.status === "unlocked" ? (
              <>
                <Check className="mx-auto size-10 text-success" />
                <span className="mt-1 font-semibold text-success">
                  Unlocked
                </span>
              </>
            ) : (
              <>
                <span className="text-xs text-ink-2">For the table</span>
                <strong className="mt-1 font-display text-[clamp(18px,5vw,32px)] font-semibold tabular-nums">
                  {formatRs(deal.groupPricePaisa)}
                </strong>
                <span className="mt-1 text-xs text-ink-2">
                  {filled} of {group.partySize} in
                </span>
              </>
            )}
          </SeatTable>
        </div>
      </section>

      <aside className="min-w-0 space-y-4 min-[61.3125rem]:sticky min-[61.3125rem]:top-[92px] min-[61.3125rem]:self-start">
        <dl className="grid gap-3 [&>div]:rounded-[18px] [&>div]:bg-secondary [&>div]:px-5 [&>div]:py-4">
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
      <div className="space-y-3 rounded-xl bg-success-soft p-7 text-foreground shadow-1">
        <p className="text-lg font-semibold">The group price is yours.</p>
        <p className="text-sm opacity-90">
          Show the voucher at the counter, then pay {deal.merchantName}{" "}
          directly.
        </p>
        <Link
          href={`/vouchers/${group.voucherId}`}
          className={buttonVariants({
            size: "lg",
            variant: "ink",
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
      <div className="space-y-4 rounded-xl bg-card p-7 shadow-2">
        <p className="font-semibold">Send the link to your friends</p>
        <ShareToly groupId={group.id} message={message} />
        <LeaveToly groupId={group.id} isOrganizer={viewer.isOrganizer} />
      </div>
    );
  }

  const user = await getCurrentUser();
  const next = encodeURIComponent(`/g/${group.id}`);
  return (
    <div className="space-y-4 rounded-xl bg-card p-7 shadow-2">
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
    <div className="space-y-4 rounded-xl bg-card p-7 shadow-2">
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
