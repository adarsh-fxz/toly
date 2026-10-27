import { formatRs } from "@toly/shared/money";
import { Ticket } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SeatDots } from "@/components/brand/seat-dots";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { serverApi } from "@/lib/api-server";
import { timeLeft } from "@/lib/dates";

export const metadata: Metadata = { title: "My tolys" };

export default function MePage() {
  return (
    <div className="py-10">
      <h1 className="text-5xl font-extrabold md:text-6xl">My tolys</h1>
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

  const ready = vouchers.filter((v) => v.status === "issued");
  const filling = groups.filter((g) => g.status === "forming");
  const past = [
    ...vouchers
      .filter((v) => v.status !== "issued")
      .map((v) => ({
        key: v.id,
        title: v.title,
        note: v.status === "redeemed" ? "Redeemed" : "Void",
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
      <div className="mt-10 rounded-2xl border border-dashed px-6 py-14 text-center">
        <p className="font-semibold">No tolys yet</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          Pick a deal, start a toly and send the link to your friends.
        </p>
        <Link href="/" className={buttonVariants({ className: "mt-5" })}>
          Browse deals
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-12">
      {ready.length > 0 ? (
        <section aria-labelledby="ready" className="space-y-4">
          <h2 id="ready" className="text-3xl font-extrabold">
            Ready to use
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {ready.map((v) => (
              <li key={v.id}>
                <Link
                  href={`/vouchers/${v.id}`}
                  className="flex items-center gap-4 rounded-2xl bg-ink p-5 text-ink-foreground transition-transform focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.99] dark:border dark:bg-card dark:text-card-foreground"
                >
                  <Ticket
                    className="size-6 shrink-0 text-primary"
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {v.title}
                    </span>
                    <span className="block truncate text-sm opacity-80">
                      {v.merchant.name}
                      {v.details.groupPricePaisa
                        ? `, ${formatRs(v.details.groupPricePaisa)}`
                        : null}
                    </span>
                  </span>
                  <span className="text-sm font-medium">Show</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {filling.length > 0 ? (
        <section aria-labelledby="filling" className="space-y-4">
          <h2 id="filling" className="text-3xl font-extrabold">
            Filling up
          </h2>
          <ul className="divide-y border-y">
            {filling.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/g/${g.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 py-4 hover:bg-card"
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
                  <SeatDots filled={g.filled} total={g.partySize} size="sm" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {past.length > 0 ? (
        <section aria-labelledby="past" className="space-y-4">
          <h2 id="past" className="text-2xl font-extrabold">
            Past
          </h2>
          <ul className="divide-y border-y">
            {past.map((p) => (
              <li key={p.key}>
                <Link
                  href={p.href}
                  className="flex items-center justify-between gap-3 py-3 hover:bg-card"
                >
                  <span className="truncate">{p.title}</span>
                  <Badge variant="secondary">{p.note}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
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
