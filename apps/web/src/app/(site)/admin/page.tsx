import { formatNepaliPhone } from "@toly/shared/phone";
import { KeyRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { readError } from "@/lib/api";
import { serverApi } from "@/lib/api-server";
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
    <div className="py-10">
      <h1 className="text-4xl font-extrabold md:text-5xl">Venue reviews</h1>
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
        className="mt-6 flex gap-1 overflow-x-auto border-b"
      >
        {tabs.map((t) => (
          <Link
            key={t.status}
            href={`/admin?status=${t.status}`}
            aria-current={t.status === status ? "page" : undefined}
            className={cn(
              "border-b-2 border-transparent px-3 py-3 text-sm font-medium whitespace-nowrap text-muted-foreground",
              t.status === status && "border-primary text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {venues.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          Nothing here right now.
        </p>
      ) : (
        <ul className="divide-y">
          {venues.map((v) => (
            <li
              key={v.id}
              className="grid gap-4 py-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-start"
            >
              <div className="min-w-0 space-y-1">
                <p className="text-lg font-semibold">{v.name}</p>
                <p className="text-sm text-muted-foreground">
                  {v.area}, {v.address}
                </p>
                <p className="text-sm">
                  Counter{" "}
                  <span className="tabular">{formatNepaliPhone(v.phone)}</span>
                  {v.panNumber ? (
                    <>
                      , PAN <span className="tabular">{v.panNumber}</span>
                    </>
                  ) : null}
                </p>
                <p className="text-sm text-muted-foreground">
                  Applied by {v.applicantName || "unnamed user"} on{" "}
                  {new Date(v.createdAt).toLocaleDateString("en-NP", {
                    dateStyle: "medium",
                  })}
                </p>
                {v.description ? (
                  <p className="max-w-prose pt-2">{v.description}</p>
                ) : null}
              </div>
              <ReviewActions merchantId={v.id} status={v.status} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function PasskeyRequired() {
  return (
    <div className="mt-8 max-w-lg space-y-4 rounded-2xl border bg-card p-6">
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
