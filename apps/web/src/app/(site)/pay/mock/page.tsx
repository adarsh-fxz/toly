import { notFound } from "next/navigation";
import { Suspense } from "react";
import { formatRs } from "@/lib/money";
import { MockCheckout } from "./mock-checkout";

export default function MockPayPage({ searchParams }: PageProps<"/pay/mock">) {
  if (process.env.NODE_ENV === "production") notFound();
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
      <p className="rounded-lg bg-secondary px-3 py-2 text-sm">
        Test checkout. No real money moves in development.
      </p>
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
