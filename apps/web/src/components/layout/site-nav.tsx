"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LogoLink } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Deals" },
  { href: "/me", label: "My tolys" },
  { href: "/merchant", label: "For venues" },
];

export function SiteNav({ account }: { account: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-[20px] backdrop-saturate-[1.7]">
      <Container className="flex h-[68px] items-center justify-between gap-4 max-sm:h-[60px]">
        <LogoLink />
        <nav aria-label="Main" className="hidden gap-0.5 min-[61.3125rem]:flex">
          {links.map(({ href, label }) => {
            const active =
              href === "/"
                ? pathname === "/" || pathname.startsWith("/deals/")
                : href === "/me"
                  ? pathname === "/me" ||
                    pathname.startsWith("/g/") ||
                    pathname.startsWith("/vouchers/")
                  : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full px-3.5 text-[15px] font-medium text-ink-2 hover:bg-secondary hover:text-foreground",
                  active && "bg-secondary text-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {account}
        </div>
      </Container>
    </header>
  );
}

export function SiteBody({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const home = pathname === "/";
  const reduce = useReducedMotion();
  return (
    <motion.main
      key={pathname}
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.12 : 0.2 }}
      id="main"
      tabIndex={-1}
      className={cn(
        "w-full flex-1 outline-none",
        !home && "mx-auto max-w-[1160px] px-10 pb-6 max-sm:px-5",
      )}
    >
      {children}
    </motion.main>
  );
}
