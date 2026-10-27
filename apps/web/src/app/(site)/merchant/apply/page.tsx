import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { VenueForm } from "@/components/merchant/venue-form";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "List your venue" };

export default function ApplyPage() {
  return (
    <div className="max-w-xl py-10">
      <h1 className="text-4xl font-extrabold md:text-5xl">List your venue</h1>
      <p className="mt-3 text-muted-foreground">
        Tell us where you are. We'll call the counter number to confirm, then
        you can create your first deal.
      </p>
      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <Apply />
        </Suspense>
      </div>
    </div>
  );
}

async function Apply() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/merchant/apply");
  if (!user.phoneNumberVerified) {
    return (
      <div className="space-y-4 rounded-2xl border bg-card p-6">
        <p className="font-medium">Verify your mobile number first</p>
        <p className="text-sm text-muted-foreground">
          We use it to reach you about your listing and to keep fake venues off
          Toly.
        </p>
        <Link href="/account" className={buttonVariants()}>
          Verify number
        </Link>
      </div>
    );
  }
  return <VenueForm />;
}
