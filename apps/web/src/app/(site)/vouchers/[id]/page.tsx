import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RotatingQr } from "@/components/voucher/rotating-qr";
import { serverApi } from "@/lib/api-server";
import { formatDateTime } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { describeOffer, formatCode } from "@/lib/voucher";

export const metadata: Metadata = {
  title: "Voucher",
  robots: { index: false },
};

export default function VoucherPage({ params }: PageProps<"/vouchers/[id]">) {
  return (
    <div className="mx-auto max-w-md py-8">
      <Suspense
        fallback={<Skeleton className="h-[34rem] w-full rounded-3xl" />}
      >
        <Voucher params={params} />
      </Suspense>
    </div>
  );
}

async function Voucher({
  params,
}: Pick<PageProps<"/vouchers/[id]">, "params">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const client = await serverApi();
  const res = await client.api.v1.me.vouchers[":id"].$get({ param: { id } });
  if (res.status === 401) redirect(`/sign-in?next=/vouchers/${id}`);
  if (!res.ok) notFound();
  const v = await res.json();
  const usable =
    v.status === "issued" &&
    (!v.expiresAt || new Date(v.expiresAt) > new Date());

  return (
    <article className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <header className="space-y-3 bg-ink p-6 text-ink-foreground dark:bg-secondary dark:text-secondary-foreground">
        <Link
          href={`/v/${v.merchant.slug}`}
          className="text-sm opacity-80 underline-offset-4 hover:underline"
        >
          {v.merchant.name}, {v.merchant.area}
        </Link>
        <h1 className="text-4xl font-extrabold">{v.title}</h1>
        <p className="text-lg font-semibold">{describeOffer(v.details)}</p>
      </header>

      {/* Perforation: the ticket tears here. */}
      <div aria-hidden className="relative h-6">
        <span className="absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full border bg-background" />
        <span className="absolute top-1/2 right-6 left-6 border-t-2 border-dashed" />
        <span className="absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full border bg-background" />
      </div>

      <div className="relative space-y-6 px-6 pb-8">
        {usable ? (
          <RotatingQr voucherId={v.id} />
        ) : (
          <div className="grid aspect-square w-full max-w-64 mx-auto place-items-center rounded-xl border-2 border-dashed">
            <p
              className={cn(
                "-rotate-12 rounded-lg border-4 px-4 py-2 font-display text-3xl font-extrabold uppercase font-condensed",
                v.status === "redeemed"
                  ? "border-success text-success"
                  : "border-muted-foreground text-muted-foreground",
              )}
            >
              {v.status === "redeemed"
                ? "Redeemed"
                : v.status === "void"
                  ? "Cancelled"
                  : "Expired"}
            </p>
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {usable ? "Or tell staff this code" : "Code"}
          </p>
          <p className="font-display text-4xl font-bold tracking-wider tabular font-wide">
            {formatCode(v.code)}
          </p>
        </div>

        <dl className="space-y-3 border-t pt-5 text-sm">
          {v.redeemedAt ? (
            <Row label="Redeemed">{formatDateTime(v.redeemedAt)}</Row>
          ) : (
            <Row label="Valid until">
              {v.expiresAt ? formatDateTime(v.expiresAt) : "Until it's used"}
            </Row>
          )}
          <Row label="Address">{v.merchant.address}</Row>
          {v.details.includes?.length ? (
            <Row label="Includes">{v.details.includes.join(", ")}</Row>
          ) : null}
          {v.details.terms ? (
            <Row label="Venue rules">{v.details.terms}</Row>
          ) : null}
        </dl>
        {usable ? (
          <p className="text-sm text-muted-foreground">
            Staff scan this before you pay. Then pay {v.merchant.name} directly,
            the way you normally would.
          </p>
        ) : null}
      </div>
    </article>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
