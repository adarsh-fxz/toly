import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
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
    <div className="max-w-3xl py-10">
      <h1 className="text-4xl font-extrabold md:text-5xl">
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
    <div className="mt-8 divide-y border-y">
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
