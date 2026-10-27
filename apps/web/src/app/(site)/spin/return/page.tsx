import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { serverApi } from "@/lib/api-server";

export default function SpinReturnPage({
  searchParams,
}: PageProps<"/spin/return">) {
  return (
    <div className="mx-auto max-w-md py-16">
      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        <Confirm searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// Providers send people back here with their own query params; we ignore those and ask the provider ourselves.
async function Confirm({
  searchParams,
}: Pick<PageProps<"/spin/return">, "searchParams">) {
  const { spin } = await searchParams;
  if (typeof spin !== "string" || !/^[0-9a-f-]{36}$/i.test(spin)) redirect("/");

  const client = await serverApi();
  const [confirmRes, stateRes] = await Promise.all([
    client.api.v1.spins[":id"].confirm.$post({ param: { id: spin } }),
    client.api.v1.spins[":id"].$get({ param: { id: spin } }),
  ]);
  if (confirmRes.status === 401)
    redirect(
      `/sign-in?next=${encodeURIComponent(`/spin/return?spin=${spin}`)}`,
    );
  if (!confirmRes.ok || !stateRes.ok) redirect("/");
  const [{ status }, state] = await Promise.all([
    confirmRes.json(),
    stateRes.json(),
  ]);

  if (status === "paid" || status === "spun")
    redirect(`/spin/${state.merchantSlug}?spin=${spin}`);

  const back = state.merchantSlug ? `/spin/${state.merchantSlug}` : "/";
  return status === "pending" ? (
    <div className="space-y-4">
      <h1 className="text-4xl font-extrabold">Waiting for your payment</h1>
      <p className="text-muted-foreground">
        The payment provider hasn't confirmed it yet. This usually takes a few
        seconds.
      </p>
      <Link
        href={`/spin/return?spin=${spin}`}
        className={buttonVariants({ size: "lg" })}
      >
        Check again
      </Link>
    </div>
  ) : (
    <div className="space-y-4">
      <h1 className="text-4xl font-extrabold">Payment didn't go through</h1>
      <p className="text-muted-foreground">
        You weren't charged for a spin. You can try again.
      </p>
      <Link href={back} className={buttonVariants({ size: "lg" })}>
        Back to the wheel
      </Link>
    </div>
  );
}
