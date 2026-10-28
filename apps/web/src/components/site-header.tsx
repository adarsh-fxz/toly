import { Suspense } from "react";
import { SiteNav } from "@/components/layout/site-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/lib/session";

export async function CurrentUserMenu() {
  const user = await getCurrentUser();
  return <UserMenu user={user} />;
}

export function SiteHeader() {
  return (
    <SiteNav
      account={
        <Suspense fallback={<Skeleton className="size-11 rounded-full" />}>
          <CurrentUserMenu />
        </Suspense>
      }
    />
  );
}
