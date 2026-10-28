import { Clock3 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Banner } from "@/components/feedback/banner";
import { Skeleton } from "@/components/ui/skeleton";
import { RedeemedStamp } from "@/components/voucher/redeemed-stamp";
import { RotatingQr } from "@/components/voucher/rotating-qr";
import { serverApi } from "@/lib/api-server";
import { formatDateTime } from "@/lib/dates";
import { describeOffer, formatCode } from "@/lib/voucher";

export const metadata: Metadata = {
  title: "Voucher",
  robots: { index: false },
};

export default function VoucherPage({ params }: PageProps<"/vouchers/[id]">) {
  return (
    <div className="mx-auto py-12 max-sm:py-7">
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
    <div className="grid items-start gap-8 min-[61.3125rem]:grid-cols-[520px_minmax(0,1fr)] min-[61.3125rem]:gap-12 [&>*]:mx-auto [&>*]:w-full [&>*]:max-w-[520px]">
      <article className="force-light overflow-hidden rounded-[32px] bg-card shadow-2">
        <header className="space-y-4 p-8 max-sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/v/${v.merchant.slug}`}
              className="text-sm text-ink-2 underline-offset-4 hover:underline"
            >
              {v.merchant.name}, {v.merchant.area}
            </Link>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${usable ? "bg-success-soft text-success" : "bg-secondary text-ink-2"}`}
            >
              {usable
                ? "Ready to use"
                : v.status === "redeemed"
                  ? "Redeemed"
                  : v.status === "void"
                    ? "Cancelled"
                    : "Expired"}
            </span>
          </div>
          <h1 className="text-[30px] font-semibold leading-tight tracking-tight">
            {v.title}
          </h1>
          <p className="text-lg font-semibold">{describeOffer(v.details)}</p>
        </header>

        <div aria-hidden className="ticket-cut my-4" />

        <div className="relative space-y-6 px-6 pb-8">
          {usable ? (
            <RotatingQr voucherId={v.id} />
          ) : (
            <div className="relative mx-auto grid aspect-square w-full max-w-64 place-items-center rounded-xl bg-secondary">
              {v.status === "redeemed" && v.redeemedAt ? (
                <RedeemedStamp at={v.redeemedAt} />
              ) : (
                <div className="p-6 text-center text-ink-2">
                  <Clock3 className="mx-auto mb-2.5 size-9" aria-hidden />
                  <b className="block text-foreground">
                    {v.status === "void"
                      ? "This voucher was cancelled"
                      : v.status === "redeemed"
                        ? "This voucher was redeemed"
                        : "This voucher has expired"}
                  </b>
                  {v.expiresAt ? (
                    <p className="mt-1 text-sm">
                      It could be used until {formatDateTime(v.expiresAt)}.
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {usable ? "Or tell staff this code" : "Code"}
            </p>
            <p
              className={`font-display text-[clamp(24px,7vw,40px)] font-semibold tracking-[0.06em] tabular-nums ${usable ? "" : "text-muted-foreground"}`}
            >
              <span className="sr-only">
                Backup code {formatCode(v.code).split("").join(" ")}
              </span>
              <span aria-hidden>{formatCode(v.code)}</span>
            </p>
          </div>
        </div>
      </article>
      <aside className="space-y-6">
        {usable ? (
          <Banner tone="neutral" title="Staff scan this before you pay">
            Then pay {v.merchant.name} directly, by cash, card or bank QR. Toly
            never takes payment for the bill.
          </Banner>
        ) : null}
        <dl className="space-y-3 rounded-xl bg-card p-7 text-sm shadow-1 max-sm:p-[22px]">
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
      </aside>
    </div>
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
