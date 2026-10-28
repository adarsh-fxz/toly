import type { Metadata } from "next";
import { Suspense } from "react";
import { DealBrowser, selectedCategory } from "@/components/deal/deal-browser";
import { DealListSkeleton } from "@/components/deal/deal-list-skeleton";
import { BackLink } from "@/components/layout/back-link";

export const metadata: Metadata = {
  title: "Group deals around Kathmandu",
  description:
    "Browse group deals at local cafés, restaurants and hangouts. Pick a table, bring your friends and pay the venue directly.",
};
export default function DealsPage({ searchParams }: PageProps<"/deals">) {
  return (
    <div className="space-y-8 py-12 max-sm:py-7">
      <header>
        <BackLink href="/" className="mb-4">
          Home
        </BackLink>
        <h1 className="text-h1 font-[650] max-sm:text-[36px]">
          Deals around Kathmandu
        </h1>
        <p className="mt-4 max-w-[34em] text-lg text-ink-2">
          One price for the whole table. You pay the venue directly.
        </p>
      </header>
      <Suspense fallback={<DealListSkeleton rows={6} />}>
        <Listing searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
async function Listing({
  searchParams,
}: Pick<PageProps<"/deals">, "searchParams">) {
  const { category } = await searchParams;
  return <DealBrowser category={selectedCategory(category)} />;
}
