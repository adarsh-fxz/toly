import {
  MERCHANT_CATEGORIES,
  type MerchantCategory,
} from "@toly/shared/merchant";
import {
  ChartNoAxesColumn,
  Clock,
  Phone,
  Plus,
  ScanLine,
  Wallet,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PersonAvatar } from "@/components/brand/person-avatar";
import { CategoryIcon } from "@/components/deal/category-icon";
import { Banner } from "@/components/feedback/banner";
import { BackLink } from "@/components/layout/back-link";
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
  if (res.status === 401) return <Pitch />;
  const venues = res.ok ? await res.json() : [];

  const approved = venues.filter((v) => v.status === "approved");
  if (venues.length === 1 && approved.length === 1 && approved[0]) {
    redirect(`/merchant/${approved[0].id}`);
  }

  if (venues.length === 0) return <Pitch />;

  return (
    <div className="py-12 max-sm:py-7">
      <BackLink href="/deals" className="mb-4">
        All deals
      </BackLink>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 font-[650] max-sm:text-[36px]">Your venues</h1>
          <p className="mt-2 text-lg text-ink-2">Venues you own or work at.</p>
        </div>
        <Link
          href="/merchant/apply"
          className={buttonVariants({ variant: "outline" })}
        >
          <Plus aria-hidden />
          List another venue
        </Link>
      </div>
      <ul className="kit-list mt-8 divide-y overflow-hidden rounded-[28px] bg-card shadow-1">
        {venues.map((v) => (
          <li
            key={v.id}
            className="flex flex-wrap items-center gap-4 px-[22px] py-5 max-sm:p-4"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground">
              <CategoryIcon category={v.category} className="size-6" />
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-lg font-semibold">{v.name}</p>
              <p className="text-sm text-muted-foreground">
                {MERCHANT_CATEGORIES[v.category as MerchantCategory]} · {v.area}{" "}
                · {v.role === "owner" ? "Owner" : "Staff"}
              </p>
              {v.status === "rejected" && v.reviewNote ? (
                <Banner tone="danger" title="Note from Toly" className="mt-2">
                  {v.reviewNote}
                </Banner>
              ) : null}
            </div>
            <StatusBadge status={v.status} />
            {v.status === "approved" || v.status === "pending" ? (
              <Link
                href={`/merchant/${v.id}`}
                className={buttonVariants({
                  variant: v.status === "approved" ? "ink" : "outline",
                  size: "sm",
                })}
              >
                {v.status === "approved" ? "Open dashboard" : "Prepare deals"}
              </Link>
            ) : null}
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
    approved: "Live",
    pending: "Under review",
    rejected: "Not approved",
    suspended: "Paused by Toly",
  }[status];
  return (
    <Badge
      variant={
        status === "approved"
          ? "success"
          : status === "pending"
            ? "warning"
            : "destructive"
      }
    >
      {label ?? status}
    </Badge>
  );
}

const promises = [
  {
    icon: Clock,
    title: "Groups at the hours you choose",
    body: "Set the days and times your deal works. Busy Friday night stays full price.",
    tone: "bg-accent text-accent-foreground",
  },
  {
    icon: Wallet,
    title: "Customers pay you, not us",
    body: "Cash, card or your bank QR, same as always. Toly never touches the bill.",
    tone: "bg-success-soft text-success",
  },
  {
    icon: ScanLine,
    title: "One scan at the counter",
    body: "Staff scan with any phone camera, or type an 8-letter code. Two taps.",
    tone: "bg-info-soft text-info",
  },
  {
    icon: ChartNoAxesColumn,
    title: "See exactly who came in",
    body: "Views, tolys started, unlocked and redeemed. No guessing what worked.",
    tone: "bg-prize-soft text-prize-ink",
  },
];

function Pitch() {
  return (
    <div className="py-12 max-sm:py-7">
      <BackLink href="/deals" className="mb-4">
        All deals
      </BackLink>
      <section
        className="night grid items-center gap-12 rounded-[40px] px-16 py-[72px] max-[61.25rem]:grid-cols-1 max-[61.25rem]:px-8 max-[61.25rem]:py-12 max-sm:gap-8 max-sm:rounded-[30px] max-sm:px-5 max-sm:py-9 min-[61.3125rem]:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]"
        aria-labelledby="pitch-heading"
      >
        <div className="relative space-y-6">
          <p className="text-sm font-medium text-[#F6BA5E]">
            For cafés, restaurants and hangouts
          </p>
          <h1
            id="pitch-heading"
            className="font-display text-[60px] font-[650] leading-[1.02] tracking-[-.045em] text-[#F3F1EC] max-[61.25rem]:text-[46px] max-sm:text-[36px]"
          >
            Fill your quiet hours with groups.
          </h1>
          <p className="max-w-[30em] text-lg leading-[1.55] text-[#CFCBD8]">
            Post a group deal for the hours you're usually empty. Friends fill
            the table from a link, show one code at your counter and pay you
            directly.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/merchant/apply"
              className={buttonVariants({
                size: "lg",
                className: "h-14 px-7 text-[17px]",
              })}
            >
              List your venue
            </Link>
            <span className="text-sm text-[#CFCBD8]">
              Free to list. We check every venue by phone first.
            </span>
          </div>
        </div>
        <figure
          className="relative flex min-w-0 flex-col gap-3.5 rounded-[28px] bg-white/[.07] p-[22px] shadow-[inset_0_0_0_1px_rgb(255_255_255/.12)] backdrop-blur-[10px]"
          aria-label="Illustration of weekday venue activity"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-[#F3F1EC]">
              Weekday afternoons
            </span>
            <Badge variant="success">Example</Badge>
          </div>
          <div
            className="grid h-[90px] grid-cols-7 items-end gap-1.5"
            aria-hidden
          >
            {[30, 45, 38, 70, 64, 92, 80].map((height, i) => (
              <i
                key={height}
                className="block rounded-t bg-[#F5B04A] motion-safe:animate-[toly-enter_.6s_both]"
                style={{ height: `${height}%`, animationDelay: `${i * 40}ms` }}
              />
            ))}
          </div>
          {[
            {
              name: "Aashma",
              title: "Momo platter for four",
              status: "Redeemed",
            },
            { name: "Sujan", title: "Karaoke room for six", status: "5 of 6" },
          ].map((row) => (
            <div
              key={row.title}
              className="flex items-center gap-3 rounded-2xl bg-white/[.06] px-3.5 py-3"
            >
              <PersonAvatar name={row.name} size={32} decorative />
              <span className="min-w-0 flex-1 text-sm text-[#F3F1EC]">
                {row.title}
              </span>
              <Badge
                variant={row.status === "Redeemed" ? "success" : "default"}
              >
                {row.status}
              </Badge>
            </div>
          ))}
          <figcaption className="text-xs text-[#CFCBD8]">
            Illustration, not live venue data.
          </figcaption>
        </figure>
      </section>
      <section className="pt-[72px]" aria-labelledby="benefits-heading">
        <h2
          id="benefits-heading"
          className="text-center text-h2 font-[650] max-[61.25rem]:text-[42px] max-sm:text-[34px]"
        >
          Why venues use Toly
        </h2>
        <ul className="kit-list mt-12 grid gap-6 sm:grid-cols-2 min-[61.3125rem]:grid-cols-4">
          {promises.map(({ icon: Icon, title, body, tone }) => (
            <li
              key={title}
              className="flex flex-col gap-3.5 rounded-[28px] bg-card p-[26px] shadow-1"
            >
              <span
                className={`grid size-12 place-items-center rounded-2xl ${tone}`}
              >
                <Icon className="size-6" aria-hidden />
              </span>
              <h3 className="text-h4 font-semibold">{title}</h3>
              <p className="text-ink-2">{body}</p>
            </li>
          ))}
        </ul>
        <Banner
          tone="neutral"
          icon={Phone}
          className="mx-auto mt-8 max-w-[680px]"
        >
          We check every venue by phone before it goes live, usually within one
          working day.
        </Banner>
        <div className="mt-8 text-center">
          <Link
            href="/merchant/apply"
            className={buttonVariants({
              size: "lg",
              className: "h-14 px-7 text-[17px]",
            })}
          >
            List your venue
          </Link>
        </div>
      </section>
    </div>
  );
}

function VenuesSkeleton() {
  return (
    <div className="space-y-6 py-12" aria-hidden>
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-96 w-full rounded-[40px]" />
    </div>
  );
}
