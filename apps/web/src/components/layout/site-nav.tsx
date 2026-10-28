"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LogoLink } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useScrollHeader } from "@/components/layout/use-scroll-header";
import { cn } from "@/lib/utils";

const links = [
  { href: "/deals", label: "Deals" },
  { href: "/me", label: "My tolys" },
  { href: "/merchant", label: "For venues" },
];

export function SiteNav({ account }: { account: ReactNode }) {
  const pathname = usePathname();
  const home = pathname === "/";
  const reduce = useReducedMotion();
  const { visible, headerRef, ...interactions } = useScrollHeader(pathname);
  const navLinks = home
    ? [
        { href: "/deals", label: "Deals" },
        { href: "/#how", label: "How it works" },
        { href: "/#spin", label: "Toly Spin" },
        { href: "/merchant", label: "For venues" },
      ]
    : links;
  return (
    <motion.header
      ref={headerRef}
      {...interactions}
      inert={!visible}
      aria-hidden={!visible}
      data-scroll-header
      data-visible={visible}
      initial={false}
      animate={{
        y: reduce ? 0 : visible ? 0 : "calc(-100% - 24px)",
        opacity: visible ? 1 : 0,
      }}
      transition={{ duration: reduce ? 0.12 : 0.32, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn(
        "z-40",
        home
          ? "glass fixed top-4 left-1/2 w-[min(1100px,calc(100%-48px))] -translate-x-1/2 rounded-full max-sm:top-2.5 max-sm:w-[calc(100%-20px)]"
          : "sticky top-0 border-b bg-background/80 backdrop-blur-[20px] backdrop-saturate-[1.7]",
        !visible && "pointer-events-none",
      )}
    >
      <Container
        className={cn(
          "flex h-[68px] items-center justify-between gap-4 max-sm:h-[60px]",
          home &&
            "h-16 px-6 pr-2.5 max-sm:h-[58px] max-sm:pl-[18px] max-sm:pr-1.5",
        )}
      >
        <LogoLink />
        <nav aria-label="Main" className="hidden gap-0.5 min-[61.3125rem]:flex">
          {navLinks.map(({ href, label }) => {
            const active =
              href === "/deals"
                ? pathname === "/deals" ||
                  pathname.startsWith("/deals/") ||
                  pathname.startsWith("/v/")
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
    </motion.header>
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
