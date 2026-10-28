"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Banner } from "@/components/feedback/banner";
import { Button, buttonVariants } from "@/components/ui/button";
import { api, readError } from "@/lib/api";
import { formatRs } from "@/lib/money";
import { segmentLabel } from "@/lib/spin-view";
import type { PublicWheel } from "@/lib/types";
import { describeOffer } from "@/lib/voucher";
import { PrizeReveal } from "./prize-reveal";
import { landingRotation, Wheel } from "./wheel";

type Phase =
  | { name: "idle" }
  | { name: "paying" }
  | { name: "spinning" }
  | { name: "won"; prize: PublicWheel["prizes"][number]; voucherId: string };

export function SpinPlayer({
  wheel,
  readySpinId,
  canSpin,
  signInHref,
  gateLabel,
  intro,
  odds,
}: {
  wheel: PublicWheel;
  readySpinId: string | null;
  canSpin: boolean;
  signInHref: string;
  gateLabel: string;
  intro: ReactNode;
  odds: ReactNode;
}) {
  const router = useRouter();
  const [spinId, setSpinId] = useState(readySpinId);
  const [phase, setPhase] = useState<Phase>({ name: "idle" });
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const actionRef = useRef<HTMLDivElement>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (revealTimer.current) clearTimeout(revealTimer.current);
    },
    [],
  );

  const segments = wheel.prizes.map((p) => ({
    id: p.id,
    ...segmentLabel(p),
  }));

  async function pay() {
    setPhase({ name: "paying" });
    setError(null);
    try {
      const res = await api.api.v1.spins.$post({
        json: { merchantSlug: wheel.merchant.slug },
      });
      if (!res.ok) {
        setPhase({ name: "idle" });
        setError((await readError(res)).message);
        return;
      }
      const { spinId: id, paymentUrl } = await res.json();
      if (paymentUrl) {
        window.location.assign(paymentUrl);
        return;
      }
      setSpinId(id);
      setPhase({ name: "idle" });
    } catch {
      setPhase({ name: "idle" });
      setError("Couldn't open checkout. Try again.");
    }
  }

  async function play() {
    if (!spinId || busy.current) return;
    busy.current = true;
    setPhase({ name: "spinning" });
    setError(null);
    try {
      const res = await api.api.v1.spins[":id"].play.$post({
        param: { id: spinId },
      });
      if (!res.ok) {
        busy.current = false;
        setPhase({ name: "idle" });
        setError((await readError(res)).message);
        return;
      }
      const result = await res.json();
      const index = Math.max(
        0,
        wheel.prizes.findIndex((p) => p.id === result.prizeId),
      );
      const prize = wheel.prizes[index];
      if (!prize) {
        busy.current = false;
        setPhase({ name: "idle" });
        return;
      }

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      setPhase({ name: "spinning" });
      setRotation(
        (current) =>
          current -
          (current % 360) +
          landingRotation(index, wheel.prizes.length, 5),
      );
      revealTimer.current = setTimeout(
        () => {
          busy.current = false;
          setPhase({ name: "won", prize, voucherId: result.voucherId });
          setSpinId(null);
          navigator.vibrate?.([80, 40, 120]);
          router.refresh();
        },
        reduced ? 600 : 4700,
      );
    } catch {
      busy.current = false;
      setPhase({ name: "idle" });
      setError(
        "Couldn't draw your prize. Try again; your paid spin is still available.",
      );
    }
  }

  return (
    <div
      className="grid gap-8 py-12 max-sm:py-7 min-[61.3125rem]:grid-cols-2 min-[61.3125rem]:items-start min-[61.3125rem]:gap-x-14"
      data-spin-phase={phase.name}
    >
      <section className="space-y-6 min-[61.3125rem]:col-start-1 min-[61.3125rem]:row-start-1">
        {intro}
        <div className="space-y-4 rounded-[32px] bg-card px-7 py-10 shadow-1 max-sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p>
              <strong className="font-display text-[30px] font-semibold tabular-nums">
                {formatRs(wheel.pricePaisa)}
              </strong>
              <span className="ml-2 text-ink-2">a spin</span>
            </p>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs text-ink-2">
              Up to {wheel.dailyLimitPerUser} a day
            </span>
          </div>
          <div ref={actionRef} aria-live="polite" className="min-h-28">
            {phase.name === "won" ? (
              <Button
                asLink
                href={`/vouchers/${phase.voucherId}`}
                size="lg"
                block
              >
                View voucher
              </Button>
            ) : !canSpin ? (
              <Link
                href={signInHref}
                className={buttonVariants({ size: "lg", className: "w-full" })}
              >
                {gateLabel}
              </Link>
            ) : spinId ? (
              <Button
                size="lg"
                className="w-full"
                onClick={play}
                disabled={phase.name === "spinning"}
                aria-busy={phase.name === "spinning"}
              >
                {phase.name === "spinning"
                  ? "Drawing your prize…"
                  : "Spin the wheel"}
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full"
                onClick={pay}
                disabled={phase.name === "paying"}
                aria-busy={phase.name === "paying"}
              >
                {phase.name === "paying"
                  ? "Opening checkout…"
                  : `Pay ${formatRs(wheel.pricePaisa)} and spin`}
              </Button>
            )}
            <p className="mt-3 text-sm text-ink-2">
              Every spin wins something. Up to {wheel.dailyLimitPerUser} spins a
              day here.
            </p>
            {error ? (
              <Banner tone="danger" className="mt-3">
                {error}
              </Banner>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            The spin fee goes to Toly. You pay the venue directly for your bill.
          </p>
        </div>
      </section>
      <aside className="min-w-0 min-[61.3125rem]:sticky min-[61.3125rem]:top-24 min-[61.3125rem]:col-start-2 min-[61.3125rem]:row-span-2 min-[61.3125rem]:row-start-1">
        <div className="night flex min-h-[600px] flex-col items-center justify-between gap-6 rounded-[40px] px-6 pt-14 pb-10 shadow-2 max-sm:min-h-0 max-sm:px-5">
          <Wheel
            segments={segments}
            rotation={rotation}
            spinning={phase.name === "spinning"}
          />
          <p className="relative max-w-[30em] text-center text-sm text-white/75">
            Slices on the wheel are equal in size. The real chances are listed
            in Prizes and chances.
          </p>
        </div>
      </aside>
      <div className="min-w-0 min-[61.3125rem]:col-start-1 min-[61.3125rem]:row-start-2">
        {odds}
      </div>
      <PrizeReveal
        returnFocus={actionRef}
        open={phase.name === "won"}
        title={phase.name === "won" ? phase.prize.label : "Your prize"}
        offer={
          phase.name === "won"
            ? `${describeOffer(phase.prize)} at ${wheel.merchant.name}.`
            : ""
        }
        voucherId={phase.name === "won" ? phase.voucherId : ""}
        onClose={() => setPhase({ name: "idle" })}
      />
    </div>
  );
}
