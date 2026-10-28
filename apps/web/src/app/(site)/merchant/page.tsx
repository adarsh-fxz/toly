import { ArrowUpRight, Clock, ScanLine, Store, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { serverApi } from "@/lib/api-server";

export const metadata: Metadata = { title: "For venues" };

export default function MerchantHomePage() {
  return (
    <Suspense fallback={<VenuesSkeleton />}>
      <MerchantHome />
    </Suspense>
  );
}

async function MerchantHome() {
  const client = await serverApi();
  const res = await client.api.v1.merchants.mine.$get();
  if (res.status === 401) redirect("/sign-in?next=/merchant");
  const venues = res.ok ? await res.json() : [];

  const approved = venues.filter((v) => v.status === "approved");
  if (venues.length === 1 && approved.length === 1 && approved[0]) {
    redirect(`/merchant/${approved[0].id}`);
  }

  if (venues.length === 0) return <Pitch />;

  return (
    <div className="max-w-3xl py-12 max-sm:py-7">
      <h1 className="text-h1 font-semibold max-sm:text-[36px]">Your venues</h1>
      <ul className="mt-8 space-y-4">
        {venues.map((v) => (
          <li
            key={v.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-card p-6 shadow-1"
          >
            <div className="min-w-0 space-y-1">
              <p className="truncate text-lg font-semibold">{v.name}</p>
              <p className="text-sm text-muted-foreground">
                {v.area}, {v.role === "owner" ? "owner" : "staff"}
              </p>
              {v.status === "rejected" && v.reviewNote ? (
                <p className="text-sm text-destructive">{v.reviewNote}</p>
              ) : null}
            </div>
            {v.status === "approved" ? (
              <Link
                href={`/merchant/${v.id}`}
                className={buttonVariants({ variant: "outline" })}
              >
                Open dashboard
              </Link>
            ) : (
              <StatusBadge status={v.status} />
            )}
          </li>
        ))}
      </ul>
      {venues.some((v) => v.status === "pending") ? (
        <p className="mt-6 flex items-start gap-2 text-sm text-muted-foreground">
          <Clock className="mt-0.5 size-4 shrink-0" aria-hidden />
          We check every venue by phone before it goes live, usually within one
          working day.
        </p>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = {
    pending: "Under review",
    rejected: "Not approved",
    suspended: "Paused by Toly",
  }[status];
  return (
    <Badge variant={status === "pending" ? "secondary" : "destructive"}>
      {label ?? status}
    </Badge>
  );
}

const promises = [
  {
    icon: Users,
    title: "Groups at the hours you choose",
    body: "Set the bundle, the price, the party size and when it can be used. Quiet weekday afternoons are a good start.",
  },
  {
    icon: Store,
    title: "Customers pay you, not us",
    body: "The bill goes through your own counter, QR or card machine. Toly never touches the money.",
  },
  {
    icon: ScanLine,
    title: "One scan at the counter",
    body: "Your staff scan the customer's code on any phone. It works once, so screenshots can't be reused.",
  },
];

function Pitch() {
  return (
    <div className="py-12 md:py-20">
      <div className="max-w-3xl space-y-6 rounded-[36px] bg-tint-a p-10 max-sm:p-6">
        <h1 className="text-h1 font-semibold max-sm:text-[36px]">
          Fill your quiet hours with groups.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Friends unlock your group deal together, then walk in and pay at your
          counter. You decide every limit, and you see exactly who came through
          the door.
        </p>
        <Link href="/merchant/apply" className={buttonVariants({ size: "lg" })}>
          List your venue
          <ArrowUpRight aria-hidden />
        </Link>
      </div>
      <ul className="mt-16 grid gap-10 md:grid-cols-3">
        {promises.map(({ icon: Icon, title, body }) => (
          <li key={title} className="space-y-4 rounded-xl bg-card p-7 shadow-1">
            <Icon className="size-6 text-accent-foreground" aria-hidden />
            <h2 className="font-sans text-lg font-semibold [font-variation-settings:normal]">
              {title}
            </h2>
            <p className="text-muted-foreground">{body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function VenuesSkeleton() {
  return (
    <div className="max-w-2xl space-y-6 py-10" aria-hidden>
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
