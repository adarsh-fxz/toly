import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Banner } from "@/components/feedback/banner";
import { BackLink } from "@/components/layout/back-link";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi } from "@/lib/api-server";
import { frontendPreview } from "@/lib/frontend-preview";
import { safeNextPath } from "@/lib/safe-redirect";
import { getCurrentUser } from "@/lib/session";
import { SignInPanel } from "./sign-in-panel";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  if (frontendPreview)
    return (
      <div className="space-y-6">
        <BackLink href="/deals">Browse sample deals</BackLink>
        <h1 className="text-h1 font-semibold">The preview is open.</h1>
        <Banner title="Sign-in is coming soon">
          Explore the sample deals and venues. Creating groups, signing in and
          checkout will be available when the interactive demo launches.
        </Banner>
      </div>
    );
  return (
    <Suspense fallback={<SignInSkeleton />}>
      <SignIn searchParams={searchParams} />
    </Suspense>
  );
}

async function SignIn({
  searchParams,
}: Pick<PageProps<"/sign-in">, "searchParams">) {
  const { next } = await searchParams;
  const nextPath = safeNextPath(typeof next === "string" ? next : null, "/me");

  const [user, config] = await Promise.all([
    getCurrentUser(),
    publicApi.api.v1.auth.config.$get().then((r) => r.json()),
  ]);
  if (user) redirect(nextPath);

  return (
    <SignInPanel
      next={nextPath}
      demo={config.demo}
      google={config.google}
      turnstileSiteKey={config.turnstileSiteKey}
    />
  );
}

function SignInSkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      <div className="space-y-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-5 w-64" />
      </div>
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
