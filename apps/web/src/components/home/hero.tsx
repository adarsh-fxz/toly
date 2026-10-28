"use client";

import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { HeroScene } from "@/components/brand/hero-scene";
import { LogoLink } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SeatRing } from "@/components/toly/seat-ring";
import type { Member } from "@/components/toly/types";
import { Button } from "@/components/ui/button";
import { formatRs, percentOff } from "@/lib/format";
import { cn } from "@/lib/utils";

export type HeroToly = {
  title: string;
  venueName: string;
  area: string;
  price: number;
  regularPrice: number;
  partySize: number;
  members: Member[];
  href?: string;
};

/** The kit's valley scene and glass hero, featuring a real deal with labelled illustrative seats. */
export function HomeHero({
  featured,
  signedIn,
  accountSlot,
}: {
  featured?: HeroToly | null;
  signedIn: boolean;
  /** the signed-in account menu; render the same AccountMenu the SiteHeader uses */
  accountSlot?: ReactNode;
}) {
  return (
    <section
      aria-labelledby="hero-h"
      className="relative isolate m-3 mb-0 min-h-[860px] overflow-hidden rounded-[36px] max-[61.25rem]:min-h-0 max-[61.25rem]:pb-[180px] max-sm:m-2 max-sm:mb-0 max-sm:rounded-[28px] max-sm:pb-[150px]"
    >
      <HeroScene idPrefix="home" />

      <header className="glass absolute left-1/2 top-5 z-[5] flex h-16 w-[min(1100px,calc(100%-48px))] -translate-x-1/2 items-center justify-between gap-6 rounded-full pl-6 pr-2.5 max-sm:top-2.5 max-sm:h-[58px] max-sm:w-[calc(100%-20px)] max-sm:pl-[18px] max-sm:pr-1.5">
        <LogoLink />
        <nav aria-label="Main" className="hidden min-[61.3125rem]:block">
          <ul className="flex gap-0.5">
            {[
              ["#deals", "Deals"],
              ["#how", "How it works"],
              ["#spin", "Toly Spin"],
              ["/merchant", "For venues"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link
                  href={href ?? "#deals"}
                  className="inline-flex min-h-11 items-center rounded-full px-[15px] text-[15px] font-medium text-ink-2 transition-colors hover:bg-glass hover:text-foreground"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {signedIn ? (
            accountSlot
          ) : (
            <Button asLink href="/sign-in" variant="ink" size="sm">
              Sign in
            </Button>
          )}
        </div>
      </header>

      <div className="relative flex flex-col items-center px-6 pt-[140px] text-center max-sm:px-4 max-sm:pt-[104px]">
        <p className="inline-flex items-center gap-2.5 rounded-full bg-glass py-[5px] pl-[5px] pr-4 text-sm font-medium text-ink-2 shadow-[inset_0_0_0_1px_var(--glass-line)] backdrop-blur-[14px] max-sm:text-[13px]">
          <b
            lang="ne"
            className="rounded-full bg-primary px-[11px] py-[3px] font-nepali text-sm font-semibold leading-[1.35] text-primary-foreground"
          >
            टोली
          </b>
          Nepali for your crew of friends
        </p>

        <h1
          id="hero-h"
          className="mt-[26px] font-display text-[74px] font-semibold leading-none tracking-[-0.045em] text-foreground max-[61.25rem]:text-[58px] max-sm:text-[42px] max-sm:tracking-[-0.04em]"
        >
          Round up your{" "}
          <span className="swash">
            toly.
            <svg
              viewBox="0 0 150 14"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M3 10 C40 3 100 2 147 8" />
            </svg>
          </span>
          <span className="block text-[var(--hero-sub)]">
            Unlock the table.
          </span>
        </h1>

        <p className="mt-[22px] max-w-[34em] text-pretty text-[19px] leading-[1.55] text-ink-2 max-sm:text-[17px]">
          Local cafés, momo spots and karaoke rooms set one price for the whole
          table. Start a toly, share the link with your group, and the deal
          unlocks when every seat fills.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3 max-sm:w-full">
          <Button
            asLink
            href="#deals"
            size="lg"
            className="max-sm:flex-[1_1_100%]"
          >
            See deals near you
            <ArrowRight className="size-[18px]" aria-hidden="true" />
          </Button>
          <Button
            asLink
            href="#how"
            variant="glass"
            size="lg"
            className="max-sm:flex-[1_1_100%]"
          >
            How it works
          </Button>
        </div>

        {featured ? (
          <HeroCard t={featured} />
        ) : (
          <p className="glass mt-12 rounded-full px-6 py-4 text-sm text-ink-2">
            Find your next table in Kathmandu Valley.
          </p>
        )}
      </div>
    </section>
  );
}

function HeroCard({ t }: { t: HeroToly }) {
  const reduce = useReducedMotion();
  const [demoFull, setDemoFull] = useState(false);
  useEffect(() => {
    if (reduce || t.members.length !== t.partySize - 1) return;
    const timer = setInterval(() => setDemoFull((v) => !v), 4500);
    return () => clearInterval(timer);
  }, [reduce, t.members.length, t.partySize]);
  const members = demoFull
    ? [...t.members, { id: "illustrative-last-seat", firstName: "Sujan" }]
    : t.members;
  const unlocked = members.length >= t.partySize;
  const off = percentOff(t.regularPrice, t.price);

  return (
    <figure
      aria-label={`Featured deal: ${t.title}. Seat illustration.`}
      className="glass mt-[54px] grid w-[min(780px,100%)] grid-cols-[minmax(0,1.25fr)_auto_minmax(0,1fr)] items-center gap-7 rounded-[32px] px-7 py-6 text-left max-sm:mt-10 max-sm:grid-cols-1 max-sm:gap-[18px] max-sm:p-[22px] max-[61.25rem]:grid-cols-[minmax(0,1fr)_auto]"
    >
      <div>
        <span
          className="inline-flex items-center gap-2 text-sm font-semibold"
          aria-hidden="true"
        >
          <i
            className={cn(
              "size-2 rounded-full",
              unlocked
                ? "bg-success"
                : "animate-[breathe_2.4s_ease-in-out_infinite] bg-primary",
            )}
          />
          Featured deal
        </span>
        <p className="mt-3 font-display text-[23px] font-semibold leading-[1.15] tracking-[-0.025em]">
          {t.title}
        </p>
        <p className="mt-[3px] text-sm text-ink-2">
          {t.venueName} · {t.area}
        </p>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-[30px] font-semibold leading-none tracking-[-0.035em] tabular-nums">
            {formatRs(t.price)}
          </span>
          <span className="text-sm text-ink-2">for the table</span>
        </div>
        <p className="mt-1.5 flex items-center gap-2.5 text-sm text-ink-2 tabular-nums">
          <s>
            <span className="sr-only">Regular price </span>
            {formatRs(t.regularPrice)}
          </s>
          <b className="font-semibold text-success">{off}% off together</b>
        </p>
      </div>

      <SeatRing
        members={members}
        size={t.partySize}
        unlocked={unlocked}
        className="max-sm:justify-self-center"
      />

      <div className="flex flex-col gap-0.5 border-l border-border pl-7 max-[61.25rem]:col-span-full max-[61.25rem]:border-l-0 max-[61.25rem]:border-t max-[61.25rem]:pl-0 max-[61.25rem]:pt-[18px]">
        <span className="text-[13px] text-ink-2">Bring your crew</span>
        <span className="font-display text-[30px] font-semibold tabular-nums">
          {t.partySize} seats
        </span>
        <span className="mt-2 text-[13px] text-ink-2">
          Illustration · start a toly to fill your table.
        </span>
        <Button
          asLink
          href={t.href ?? "#deals"}
          variant="ink"
          size="sm"
          className="mt-3"
        >
          See the deal
        </Button>
      </div>
    </figure>
  );
}
