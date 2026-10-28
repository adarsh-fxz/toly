import { MERCHANT_CATEGORIES } from "@toly/shared/merchant";
import Link from "next/link";
import { Banner } from "@/components/feedback/banner";
import { EmptyState } from "@/components/feedback/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { publicApi } from "@/lib/api-server";
import { groupNepali } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DealRow } from "./deal-row";

export function selectedCategory(value: string | string[] | undefined) {
  return typeof value === "string" && value in MERCHANT_CATEGORIES
    ? value
    : undefined;
}

/** One browsing surface for the landing preview and the dedicated, shareable deal listing. */
export async function DealBrowser({
  category,
  preview = false,
}: {
  category?: string;
  preview?: boolean;
}) {
  const base = preview ? "/" : "/deals";
  const res = await publicApi.api.v1.deals.$get({ query: { category } });
  if (!res.ok)
    return (
      <Banner
        tone="danger"
        title="Couldn't load deals"
        action={
          <a
            href={base}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Try again
          </a>
        }
      >
        Try again in a moment.
      </Banner>
    );
  const deals = await res.json();
  const shown = preview ? deals.slice(0, 6) : deals;
  return (
    <div className="space-y-6">
      <nav aria-label="Filter by category" className="flex flex-wrap gap-2">
        {[
          { key: "", label: "Everything" },
          ...Object.entries(MERCHANT_CATEGORIES)
            .filter(([key]) => key !== "other")
            .map(([key, label]) => ({ key, label })),
        ].map(({ key, label }) => (
          <Link
            key={key}
            href={key ? `${base}?category=${key}` : base}
            scroll={false}
            aria-current={(category ?? "") === key ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center rounded-full border border-input bg-card px-4 text-sm font-medium transition-[background-color,color,box-shadow] hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50",
              (category ?? "") === key
                ? "border-foreground bg-foreground text-background shadow-1 hover:bg-foreground"
                : "shadow-1",
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
      {!preview ? (
        <p role="status" className="text-sm text-muted-foreground">
          {groupNepali(deals.length)} {deals.length === 1 ? "deal" : "deals"}
          {category
            ? ` in ${MERCHANT_CATEGORIES[category as keyof typeof MERCHANT_CATEGORIES]}`
            : " to explore"}
        </p>
      ) : null}
      {shown.length ? (
        <ul className="kit-list grid gap-5 sm:grid-cols-2 min-[61.3125rem]:grid-cols-3">
          {shown.map((deal) => (
            <li key={deal.id} className="flex min-w-0 flex-col [&>a]:flex-1">
              <DealRow deal={deal} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No deals here yet"
          body="Try another category, or check back for new deals."
          action={
            category ? (
              <Link
                href={base}
                className={buttonVariants({ variant: "outline" })}
              >
                Show all deals
              </Link>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
