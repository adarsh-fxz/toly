"use client";

import { LayoutGrid, ScanLine, Tag, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "", label: "Overview", icon: LayoutGrid, ownerOnly: false },
  { href: "/scan", label: "Scan", icon: ScanLine, ownerOnly: false },
  { href: "/deals", label: "Deals", icon: Tag, ownerOnly: false },
  { href: "/team", label: "Team", icon: Users, ownerOnly: true },
];

// Bottom tab bar on phones (thumb reach at a busy counter), inline tabs on larger screens.
export function MerchantNav({
  merchantId,
  role,
}: {
  merchantId: string;
  role: "owner" | "staff";
}) {
  const pathname = usePathname();
  const base = `/merchant/${merchantId}`;

  return (
    <nav
      aria-label="Venue"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:static md:border-t-0 md:border-b md:bg-transparent md:pb-0 md:backdrop-blur-none"
    >
      <ul className="mx-auto flex max-w-6xl justify-around md:justify-start md:gap-1">
        {items
          .filter((item) => role === "owner" || !item.ownerOnly)
          .map(({ href, label, icon: Icon }) => {
            const target = `${base}${href}`;
            const active =
              href === "" ? pathname === base : pathname.startsWith(target);
            return (
              <li key={label}>
                <Link
                  href={target}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 min-w-16 flex-col items-center justify-center gap-0.5 px-3 text-xs font-medium text-muted-foreground transition-colors md:min-h-11 md:flex-row md:gap-2 md:border-b-2 md:border-transparent md:text-sm",
                    "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    active && "text-foreground md:border-primary",
                  )}
                >
                  <Icon
                    className={cn("size-5 md:size-4", active && "text-primary")}
                    aria-hidden
                  />
                  {label}
                </Link>
              </li>
            );
          })}
      </ul>
    </nav>
  );
}
