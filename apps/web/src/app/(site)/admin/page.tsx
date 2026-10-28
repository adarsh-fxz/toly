import { KeyRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { readError } from "@/lib/api";
import { serverApi } from "@/lib/api-server";
import { formatDate, formatPhone as formatNepaliPhone } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ReviewActions } from "./review-actions";

export const metadata: Metadata = { title: "Admin" };

const tabs = [
  { status: "pending", label: "To review" },
  { status: "approved", label: "Live" },
  { status: "suspended", label: "Paused" },
  { status: "rejected", label: "Declined" },
] as const;

type Status = (typeof tabs)[number]["status"];

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <div className="py-12 max-sm:py-7">
      <h1 className="text-h1 font-semibold max-sm:text-[36px]">
        Venue reviews
      </h1>
      <Suspense fallback={<Skeleton className="mt-8 h-64 w-full" />}>
        <Queue searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Queue({
  searchParams,
}: Pick<PageProps<"/admin">, "searchParams">) {
  const { status: raw } = await searchParams;
  const status: Status = tabs.some((t) => t.status === raw)
    ? (raw as Status)
    : "pending";

  const client = await serverApi();
  const res = await client.api.v1.admin.merchants.$get({ query: { status } });
  if (res.status === 401) redirect("/sign-in?next=/admin");
  if (!res.ok) {
    const body = await readError(res);
    if (body.error === "PASSKEY_REQUIRED") return <PasskeyRequired />;
    notFound();
  }
  const venues = await res.json();

  return (
    <>
      <nav
        aria-label="Review status"
        className="mt-8 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-secondary p-1.5"
      >
        {tabs.map((t) => (
          <Link
            key={t.status}
            href={`/admin?status=${t.status}`}
            aria-current={t.status === status ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground",
              t.status === status && "bg-card text-foreground shadow-1",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {venues.length === 0 ? (
        <EmptyState
          className="mt-7"
          title="All caught up"
          body="There are no venues in this queue right now."
        />
      ) : (
        <div className="mt-7 overflow-hidden rounded-xl bg-card shadow-1">
          <table className="block w-full text-left text-sm min-[61.3125rem]:table">
            <caption className="sr-only">Venue reviews</caption>
            <thead className="hidden bg-secondary text-ink-2 min-[61.3125rem]:table-header-group">
              <tr>
                <th scope="col" className="p-5 font-medium">
                  Venue
                </th>
                <th scope="col" className="p-5 font-medium">
                  Application
                </th>
                <th scope="col" className="p-5 font-medium">
                  Review
                </th>
              </tr>
            </thead>
            <tbody className="block divide-y min-[61.3125rem]:table-row-group">
              {venues.map((v) => (
                <tr
                  key={v.id}
                  className="block align-top min-[61.3125rem]:table-row"
                >
                  <td className="block p-5 min-[61.3125rem]:table-cell">
                    <p className="font-display text-h4 font-semibold">
                      {v.name}
                    </p>
                    <p className="mt-2 text-ink-2">
                      {v.area}, {v.address}
                    </p>
                    <p className="mt-3 tabular-nums">
                      Counter {formatNepaliPhone(v.phone)}
                    </p>
                    {v.panNumber ? (
                      <p className="mt-1 text-muted-foreground tabular-nums">
                        PAN {v.panNumber}
                      </p>
                    ) : null}
                    {v.description ? (
                      <p className="mt-3 max-w-prose text-ink-2">
                        {v.description}
                      </p>
                    ) : null}
                  </td>
                  <td className="block px-5 pb-5 text-ink-2 min-[61.3125rem]:table-cell min-[61.3125rem]:pt-5">
                    <p>{v.applicantName || "Unnamed user"}</p>
                    <time className="mt-1 block text-[13px] text-muted-foreground">
                      {formatDate(v.createdAt)}
                    </time>
                  </td>
                  <td className="block p-5 pt-0 min-[61.3125rem]:table-cell min-[61.3125rem]:pt-5">
                    <ReviewActions merchantId={v.id} status={v.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function PasskeyRequired() {
  return (
    <div className="mt-8 max-w-lg space-y-4 rounded-xl bg-card p-7 shadow-1">
      <KeyRound className="size-6 text-primary" aria-hidden />
      <p className="text-lg font-semibold">Add a passkey to use admin tools</p>
      <p className="text-muted-foreground">
        Admin access needs a sign-in that can't be phished. It takes a few
        seconds with your fingerprint or screen lock.
      </p>
      <Link href="/account" className={buttonVariants()}>
        Add a passkey
      </Link>
    </div>
  );
}
