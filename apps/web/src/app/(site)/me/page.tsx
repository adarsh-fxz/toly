import { Ticket } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PersonAvatar } from "@/components/brand/person-avatar";
import { EmptyState } from "@/components/feedback/empty-state";
import { MyTolyTabs } from "@/components/group/my-toly-tabs";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { serverApi } from "@/lib/api-server";
import { timeLeft } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import { describeOffer } from "@/lib/voucher";

export const metadata: Metadata = { title: "My tolys" };

export default function MePage() {
  return (
    <div className="py-12 max-sm:py-7">
      <h1 className="text-h1 font-semibold max-sm:text-[36px]">My tolys</h1>
      <Suspense fallback={<MeSkeleton />}>
        <Me />
      </Suspense>
    </div>
  );
}

async function Me() {
  const client = await serverApi();
  const [groupsRes, vouchersRes] = await Promise.all([
    client.api.v1.me.groups.$get(),
    client.api.v1.me.vouchers.$get(),
  ]);
  if (groupsRes.status === 401) redirect("/sign-in?next=/me");
  const groups = groupsRes.ok ? await groupsRes.json() : [];
  const vouchers = vouchersRes.ok ? await vouchersRes.json() : [];

  const isReady = (v: (typeof vouchers)[number]) =>
    v.status === "issued" &&
    (!v.expiresAt || new Date(v.expiresAt) > new Date());
  const ready = vouchers.filter(isReady);
  const filling = groups.filter((g) => g.status === "forming");
  const past = [
    ...vouchers
      .filter((v) => !isReady(v))
      .map((v) => ({
        key: v.id,
        title: v.title,
        note:
          v.status === "redeemed"
            ? "Redeemed"
            : v.status === "void"
              ? "Cancelled"
              : "Expired",
        href: `/vouchers/${v.id}`,
      })),
    ...groups
      .filter((g) => g.status === "expired" || g.status === "cancelled")
      .map((g) => ({
        key: g.id,
        title: g.title,
        note: g.status === "expired" ? "Didn't fill in time" : "Cancelled",
        href: `/g/${g.id}`,
      })),
  ];

  if (groups.length === 0 && vouchers.length === 0) {
    return (
      <EmptyState
        className="mt-12"
        title="No tolys yet"
        body="Pick a deal, start a toly and send the link to your friends. Your vouchers will show up here."
        action={
          <Link href="/" className={buttonVariants()}>
            Browse deals
          </Link>
        }
      />
    );
  }

  return (
    <MyTolyTabs
      ready={ready.length}
      filling={filling.length}
      past={past.length}
    >
      <div className="mt-8 space-y-12">
        {ready.length > 0 ? (
          <section
            data-toly-section="ready"
            aria-labelledby="ready"
            className="space-y-4"
          >
            <h2 id="ready" className="text-h3 font-semibold">
              Ready to use
            </h2>
            <ul className="kit-list grid gap-3 sm:grid-cols-2">
              {ready.map((v) => (
                <li key={v.id}>
                  <Link
                    href={`/vouchers/${v.id}`}
                    className="flex min-h-36 items-stretch gap-4 overflow-hidden rounded-xl bg-card p-6 text-foreground shadow-1 transition-transform focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.99] dark:border dark:bg-card dark:text-card-foreground"
                  >
                    <span
                      className="relative -my-6 -ml-6 grid min-h-36 w-16 shrink-0 self-stretch place-items-center border-r-2 border-dashed border-input bg-tint-a before:absolute before:-right-[9px] before:-top-2 before:size-4 before:rounded-full before:bg-background after:absolute after:-bottom-2 after:-right-[9px] after:size-4 after:rounded-full after:bg-background sm:w-20"
                      aria-hidden
                    >
                      <Ticket className="size-6 text-accent-ink" />
                    </span>
                    <span className="min-w-0 flex-1 space-y-1">
                      <span className="block truncate text-sm text-muted-foreground">
                        {v.merchant.name}
                      </span>
                      <span className="block font-display text-h4 font-semibold">
                        {v.title}
                      </span>
                      <span className="block text-sm text-ink-2">
                        {describeOffer(v.details)}
                      </span>
                      <span className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <Badge variant="secondary">
                          {v.expiresAt
                            ? `Use by ${formatDate(v.expiresAt)}`
                            : "Until it's used"}
                        </Badge>
                        <span
                          className={buttonVariants({
                            variant: "ink",
                            size: "sm",
                          })}
                        >
                          Show
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {filling.length > 0 ? (
          <section
            data-toly-section="filling"
            aria-labelledby="filling"
            className="space-y-4"
          >
            <h2 id="filling" className="text-h3 font-semibold">
              Filling up
            </h2>
            <ul className="kit-list grid gap-4 sm:grid-cols-2">
              {filling.map((g) => (
                <li key={g.id}>
                  <Link
                    href={`/g/${g.id}`}
                    className="flex flex-col gap-4 rounded-xl bg-card p-6 shadow-1 transition-[transform,box-shadow] hover:-translate-y-[3px] hover:shadow-2"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {g.title}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {g.merchantName}, closes in{" "}
                        <span className="tabular">{timeLeft(g.expiresAt)}</span>
                      </span>
                    </span>
                    <span className="flex items-center justify-between gap-3">
                      <span
                        className="flex flex-wrap gap-1.5"
                        role="img"
                        aria-label={`${g.filled} of ${g.partySize} seats filled`}
                      >
                        {Array.from(
                          { length: g.partySize },
                          (_, position) => position,
                        ).map((position) =>
                          position < g.filled ? (
                            <PersonAvatar
                              key={position}
                              name="Member"
                              seed={`${g.id}-${position}`}
                              size={36}
                              decorative
                            />
                          ) : (
                            <i
                              key={position}
                              className="size-9 rounded-full bg-card shadow-[inset_0_0_0_1.5px_var(--seat-line)]"
                            />
                          ),
                        )}
                      </span>
                      <span className="text-sm font-semibold tabular-nums">
                        {g.filled} of {g.partySize}
                      </span>
                    </span>
                    <span
                      className="h-1.5 overflow-hidden rounded-full bg-secondary"
                      aria-hidden
                    >
                      <span
                        className="block h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.min(100, (g.filled / g.partySize) * 100)}%`,
                        }}
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {past.length > 0 ? (
          <section
            data-toly-section="past"
            aria-labelledby="past"
            className="space-y-4"
          >
            <h2 id="past" className="text-h3 font-semibold">
              Past
            </h2>
            <ul className="kit-list divide-y overflow-hidden rounded-xl bg-card px-6 shadow-1">
              {past.map((p) => (
                <li key={p.key}>
                  <Link
                    href={p.href}
                    className="flex items-center justify-between gap-3 py-3 hover:bg-card"
                  >
                    <span className="truncate">{p.title}</span>
                    <Badge
                      variant={p.note === "Redeemed" ? "success" : "secondary"}
                    >
                      {p.note}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </MyTolyTabs>
  );
}

function MeSkeleton() {
  return (
    <div className="mt-10 space-y-4" aria-hidden>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
