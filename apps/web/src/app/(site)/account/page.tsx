import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { BackLink } from "@/components/layout/back-link";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi } from "@/lib/api-server";
import { getCurrentUser } from "@/lib/session";
import {
  PasskeysSection,
  PhoneSection,
  ProfileSection,
  SessionsSection,
} from "./sections";

export const metadata: Metadata = { title: "Account and security" };

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-[920px] py-12 max-sm:py-7">
      <BackLink href="/me" className="mb-4">
        My tolys
      </BackLink>
      <h1 className="text-h1 font-semibold max-sm:text-[36px]">
        Account and security
      </h1>
      <Suspense fallback={<AccountSkeleton />}>
        <Account />
      </Suspense>
    </div>
  );
}

async function Account() {
  const [user, config] = await Promise.all([
    getCurrentUser(),
    publicApi.api.v1.auth.config.$get().then((r) => r.json()),
  ]);
  if (!user) redirect("/sign-in?next=/account");

  return (
    <div className="mt-9 space-y-5">
      <ProfileSection name={user.name} />
      <PhoneSection
        phoneNumber={user.phoneNumberVerified ? user.phoneNumber : null}
        turnstileSiteKey={config.turnstileSiteKey}
      />
      <PasskeysSection />
      <SessionsSection />
    </div>
  );
}

function AccountSkeleton() {
  return (
    <div className="mt-8 space-y-8" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-11 w-full" />
        </div>
      ))}
    </div>
  );
}
