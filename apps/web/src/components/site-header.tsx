import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/components/user-menu";
import { Wordmark } from "@/components/wordmark";
import { getCurrentUser } from "@/lib/session";

async function CurrentUserMenu() {
  const user = await getCurrentUser();
  return <UserMenu user={user} />;
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Link
          href="/"
          className="-m-2 rounded-lg p-2 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label="Toly home"
        >
          <Wordmark />
        </Link>
        <Suspense fallback={<Skeleton className="size-10 rounded-full" />}>
          <CurrentUserMenu />
        </Suspense>
      </div>
    </header>
  );
}
