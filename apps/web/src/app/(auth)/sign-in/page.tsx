import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi } from "@/lib/api-server";
import { safeNextPath } from "@/lib/safe-redirect";
import { getCurrentUser } from "@/lib/session";
import { SignInPanel } from "./sign-in-panel";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage({ searchParams }: PageProps<"/sign-in">) {
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
