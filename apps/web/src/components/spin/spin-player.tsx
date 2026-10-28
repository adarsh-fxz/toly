"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { api, readError } from "@/lib/api";
import { formatRs } from "@/lib/money";
import type { PublicWheel } from "@/lib/types";
import { describeOffer } from "@/lib/voucher";
import { landingRotation, segmentLabel, Wheel } from "./wheel";

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
}: {
  wheel: PublicWheel;
  readySpinId: string | null;
  canSpin: boolean;
  signInHref: string;
  gateLabel: string;
}) {
  const router = useRouter();
  const [spinId, setSpinId] = useState(readySpinId);
  const [phase, setPhase] = useState<Phase>({ name: "idle" });
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const segments = wheel.prizes.map((p) => ({
    id: p.id,
    ...segmentLabel(p),
  }));

  async function pay() {
    setPhase({ name: "paying" });
    setError(null);
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
  }

  async function play() {
    if (!spinId) return;
    setError(null);
    const res = await api.api.v1.spins[":id"].play.$post({
      param: { id: spinId },
    });
    if (!res.ok) {
      setError((await readError(res)).message);
      return;
    }
    const result = await res.json();
    const index = Math.max(
      0,
      wheel.prizes.findIndex((p) => p.id === result.prizeId),
    );
    const prize = wheel.prizes[index];
    if (!prize) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setPhase({ name: "spinning" });
    setRotation(
      (current) =>
        current -
        (current % 360) +
        landingRotation(index, wheel.prizes.length, 6, Math.random() - 0.5),
    );
    setTimeout(
      () => {
        setPhase({ name: "won", prize, voucherId: result.voucherId });
        setSpinId(null);
        navigator.vibrate?.([80, 40, 120]);
        router.refresh();
      },
      reduced ? 50 : 4700,
    );
  }

  return (
    <div className="space-y-8 rounded-[32px] bg-card px-7 py-10 shadow-2 max-sm:px-5">
      <Wheel
        segments={segments}
        rotation={rotation}
        spinning={phase.name === "spinning"}
      />

      <div aria-live="polite" className="min-h-28">
        {phase.name === "won" ? (
          <div className="space-y-4 rounded-xl bg-prize-soft p-6 text-foreground">
            <p className="text-sm font-semibold">You won</p>
            <p className="font-display text-h3 font-semibold">
              {phase.prize.label}
            </p>
            <p>{describeOffer(phase.prize)}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link
                href={`/vouchers/${phase.voucherId}`}
                className={buttonVariants({ size: "lg", className: "w-full" })}
              >
                View voucher
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-input bg-transparent"
                onClick={() => setPhase({ name: "idle" })}
              >
                Done
              </Button>
            </div>
          </div>
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
          >
            {phase.name === "spinning"
              ? "Drawing your prize…"
              : "Spin the wheel"}
          </Button>
        ) : (
          <div className="space-y-2">
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
            <p className="text-center text-sm text-muted-foreground">
              Every spin wins something. Up to {wheel.dailyLimitPerUser} spins a
              day here.
            </p>
          </div>
        )}
        {error ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
