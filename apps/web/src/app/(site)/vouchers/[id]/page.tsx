import { Clock3, ShieldCheck, Sun } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { AvatarStack } from "@/components/brand/person-avatar";
import { Banner } from "@/components/feedback/banner";
import { BackLink } from "@/components/layout/back-link";
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
      <BackLink href="/me" className="mb-4">
        My tolys
      </BackLink>
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
  const groupResponse = v.groupId
    ? await client.api.v1.groups[":id"].$get({ param: { id: v.groupId } })
    : null;
  const group = groupResponse?.ok ? await groupResponse.json() : null;
  const memberNames =
    group?.members.map((member) => (member.isYou ? "you" : member.name)) ?? [];
  const usable =
    v.status === "issued" &&
    (!v.expiresAt || new Date(v.expiresAt) > new Date());

  return (
    <div className="grid items-start gap-8 min-[61.3125rem]:grid-cols-[480px_minmax(0,1fr)] min-[61.3125rem]:gap-14 [&>*]:mx-auto [&>*]:w-full max-[980px]:[&>*]:max-w-[560px]">
      <article className="force-light overflow-hidden rounded-[30px] bg-card shadow-2">
        <header className="flex flex-col gap-1.5 px-7 pt-7 pb-6 max-sm:p-[22px]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              href={`/v/${v.merchant.slug}`}
              className="text-sm text-ink-2 underline-offset-4 hover:underline"
            >
              {v.merchant.name} · {v.merchant.area}
            </Link>
            <span
              className={`inline-flex min-h-[26px] items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold ${usable ? "bg-success-soft text-success" : "bg-secondary text-ink-2"}`}
            >
              <i className="size-1.5 rounded-full bg-current" aria-hidden />
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
          <p className="text-[17px] font-semibold">
            {describeOffer(v.details)}
          </p>
          {group?.members.length ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <AvatarStack
                size={32}
                people={group.members.map((member, i) => ({
                  id: `${group.id}-${i}-${member.name}`,
                  name: member.name,
                }))}
              />
              <span className="text-sm text-ink-2">
                {new Intl.ListFormat("en", {
                  style: "long",
                  type: "conjunction",
                }).format(memberNames)}
              </span>
            </div>
          ) : null}
        </header>

        <div aria-hidden className="ticket-cut" />

        <div className="relative flex flex-col items-center gap-4 p-7 max-sm:p-[22px]">
          {usable ? (
            <RotatingQr voucherId={v.id} />
          ) : (
            <div className="relative mx-auto grid aspect-square w-full max-w-[296px] place-items-center rounded-xl bg-secondary">
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
              className={`mt-1 font-display text-[40px] font-semibold leading-none tracking-[0.06em] max-sm:text-[34px] tabular-nums ${usable ? "" : "text-muted-foreground"}`}
            >
              <span className="sr-only">
                Backup code {formatCode(v.code).split("").join(" ")}
              </span>
              <span aria-hidden>{formatCode(v.code)}</span>
            </p>
          </div>
          {usable ? (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sun className="size-4 shrink-0" aria-hidden />
              Screen stays awake and bright while this is open
            </p>
          ) : null}
        </div>
      </article>
      <aside className="space-y-6">
        {usable ? (
          <Banner
            tone="neutral"
            icon={ShieldCheck}
            title="Staff scan this before you pay"
            className="[&_svg]:text-success"
          >
            Then pay {v.merchant.name} directly, by cash, card or bank QR. Toly
            never takes payment for the bill.
          </Banner>
        ) : null}
        <dl className="space-y-3 rounded-xl bg-card p-7 text-[15px] shadow-1 max-sm:p-[22px]">
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
    <div className="grid grid-cols-[84px_minmax(0,1fr)] gap-x-6 gap-y-1 max-sm:grid-cols-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
