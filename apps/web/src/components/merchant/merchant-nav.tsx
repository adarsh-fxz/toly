"use client";

import { Dices, LayoutGrid, ScanLine, Tag, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "", label: "Overview", icon: LayoutGrid, ownerOnly: false },
  { href: "/scan", label: "Scan", icon: ScanLine, ownerOnly: false },
  { href: "/deals", label: "Deals", icon: Tag, ownerOnly: false },
  { href: "/spin", label: "Spin", icon: Dices, ownerOnly: true },
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
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur min-[981px]:static min-[981px]:border-t-0 min-[981px]:rounded-full min-[981px]:bg-secondary min-[981px]:p-1.5 min-[981px]:pb-0 min-[981px]:backdrop-blur-none"
    >
      <ul className="mx-auto flex max-w-6xl justify-around min-[981px]:justify-start min-[981px]:gap-1">
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
                    "flex min-h-14 min-w-14 flex-col items-center justify-center gap-0.5 px-2 text-xs font-medium text-muted-foreground transition-colors min-[981px]:min-h-11 min-[981px]:flex-row min-[981px]:gap-2 min-[981px]:rounded-full min-[981px]:text-sm",
                    "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    active &&
                      "text-foreground min-[981px]:bg-card min-[981px]:shadow-1",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5 min-[981px]:size-4",
                      active && "text-accent-foreground",
                    )}
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
