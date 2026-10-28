"use client";

import { motion, useReducedMotion } from "motion/react";
import { LogoMark } from "@/components/brand/logo";
import { wheelSpin } from "@/lib/motion";
import { wheelColor } from "@/lib/spin-view";
import { cn } from "@/lib/utils";

type Segment = { id: string; short: string; sub: string; hot?: boolean };

export function landingRotation(
  index: number,
  count: number,
  turns = 6,
  jitter = 0,
) {
  const step = 360 / count;
  return turns * 360 - (index * step + step / 2) + jitter * step * 0.35;
}

/** Kit presentation driven by the existing server-selected result and rotation. */
export function Wheel({
  segments,
  rotation,
  spinning,
  className,
  size = "lg",
}: {
  segments: Segment[];
  rotation: number;
  spinning: boolean;
  className?: string;
  size?: "lg" | "demo" | "compact";
}) {
  const reduce = useReducedMotion();
  const slice = 360 / segments.length;
  const background = `conic-gradient(${segments.map((segment, i) => `${wheelColor(i, segment.hot)} ${i * slice}deg ${(i + 1) * slice}deg`).join(",")})`;
  const labels = segments.map((segment, i) => (
    <span
      key={segment.id}
      className={cn("wheel-label", segment.hot && "hot")}
      style={{ ["--a" as string]: `${i * slice + slice / 2}deg` }}
    >
      <b>{segment.short}</b>
      <span>{segment.sub}</span>
    </span>
  ));
  return (
    <div
      className={cn("wheel-wrap mx-auto", `wheel-${size}`, className)}
      role="img"
      aria-label={`Prize wheel: ${segments.map((s) => `${s.short} ${s.sub}`).join(", ")}`}
    >
      {size === "demo" ? (
        <div className="wheel-disc" style={{ background }}>
          {labels}
        </div>
      ) : (
        <motion.div
          className="wheel-disc"
          style={{ background }}
          initial={false}
          animate={{ rotate: rotation }}
          transition={spinning && !reduce ? wheelSpin : { duration: 0 }}
        >
          {labels}
        </motion.div>
      )}

      <div className="wheel-dots" aria-hidden="true">
        {Array.from(
          { length: size === "compact" ? 12 : 24 },
          (_, position) => position,
        ).map((i) => (
          <i
            key={i}
            style={{
              ["--a" as string]: `${i * (size === "compact" ? 30 : 15)}deg`,
            }}
          />
        ))}
      </div>
      <span className="wheel-hub" aria-hidden="true">
        <LogoMark tile={false} size={34} />
      </span>
      <svg className="wheel-pointer" viewBox="0 0 30 38" aria-hidden="true">
        <path
          d="M15 37 C11 30 3 22 3 14 a12 12 0 0 1 24 0 c0 8-8 16-12 23Z"
          fill="var(--primary)"
          stroke="var(--qr-bg)"
          strokeWidth="2.5"
        />
        <circle cx="15" cy="14" r="4.5" fill="var(--qr-bg)" />
      </svg>
    </div>
  );
}
