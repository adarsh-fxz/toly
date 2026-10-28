import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Banner } from "@/components/feedback/banner";
import { formatRs } from "@/lib/money";
import { MockCheckout } from "./mock-checkout";

export default function MockPayPage({ searchParams }: PageProps<"/pay/mock">) {
  if (process.env.NODE_ENV === "production" && process.env.DEMO_MODE !== "true")
    notFound();
  return (
    <Suspense>
      <Checkout searchParams={searchParams} />
    </Suspense>
  );
}

async function Checkout({
  searchParams,
}: Pick<PageProps<"/pay/mock">, "searchParams">) {
  const { ref, amount, name } = await searchParams;
  if (typeof ref !== "string") notFound();
  return (
    <div className="mx-auto max-w-sm space-y-6 py-16">
      <Banner tone="warn" title="Test checkout">
        No real money moves. This simulates a successful or cancelled payment.
      </Banner>
      <div className="space-y-1">
        <p className="text-muted-foreground">
          {typeof name === "string" ? name : "Payment"}
        </p>
        <p className="text-5xl font-extrabold tabular">
          {formatRs(Number(amount) || 0)}
        </p>
      </div>
      <MockCheckout reference={ref} />
    </div>
  );
}
